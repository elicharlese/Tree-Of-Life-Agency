import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';
import { logger } from '../middleware/logging';
import { sendEmail } from '../services/emailService';
import { publishNewActivity, publishDashboardUpdate } from '../graphql/pubsub';

const prisma = new PrismaClient();

// Webhook validation schemas
const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  created: z.number(),
  livemode: z.boolean(),
});

const zoomWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    account_id: z.string(),
    object: z.any(),
  }),
});

const slackWebhookSchema = z.object({
  token: z.string(),
  team_id: z.string(),
  api_app_id: z.string(),
  event: z.object({
    type: z.string(),
    user: z.string().optional(),
    text: z.string().optional(),
    ts: z.string(),
    channel: z.string().optional(),
  }),
  type: z.literal('event_callback'),
});

// Webhook signature verification
const verifyStripeSignature = (payload: string, signature: string): boolean => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('Stripe webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    logger.error('Stripe signature verification error', { error });
    return false;
  }
};

const verifyZoomSignature = (payload: string, signature: string, timestamp: string): boolean => {
  try {
    const secret = process.env.ZOOM_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('Zoom webhook secret not configured');
      return false;
    }

    const message = `v0:${timestamp}:${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    return signature === `v0=${expectedSignature}`;
  } catch (error) {
    logger.error('Zoom signature verification error', { error });
    return false;
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (!verifyStripeSignature(payload, signature)) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = stripeWebhookSchema.parse(req.body);
    
    logger.info('Processing Stripe webhook', { 
      eventType: event.type,
      eventId: event.id 
    });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object);
        break;
        
      default:
        logger.info('Unhandled Stripe webhook event', { type: event.type });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', { error });
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// Zoom webhook handler
export const handleZoomWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['authorization'] as string;
    const timestamp = req.headers['x-zm-request-timestamp'] as string;
    const payload = JSON.stringify(req.body);

    if (!verifyZoomSignature(payload, signature, timestamp)) {
      logger.warn('Invalid Zoom webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = zoomWebhookSchema.parse(req.body);
    
    logger.info('Processing Zoom webhook', { 
      eventType: event.event,
      accountId: event.payload.account_id 
    });

    switch (event.event) {
      case 'meeting.started':
        await handleMeetingStarted(event.payload.object);
        break;
        
      case 'meeting.ended':
        await handleMeetingEnded(event.payload.object);
        break;
        
      case 'meeting.participant_joined':
        await handleParticipantJoined(event.payload.object);
        break;
        
      case 'recording.completed':
        await handleRecordingCompleted(event.payload.object);
        break;
        
      default:
        logger.info('Unhandled Zoom webhook event', { type: event.event });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Zoom webhook error', { error });
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// Slack webhook handler
export const handleSlackWebhook = async (req: Request, res: Response) => {
  try {
    // Handle URL verification challenge
    if (req.body.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge });
    }

    const event = slackWebhookSchema.parse(req.body);
    
    logger.info('Processing Slack webhook', { 
      eventType: event.event.type,
      teamId: event.team_id 
    });

    switch (event.event.type) {
      case 'message':
        await handleSlackMessage(event.event);
        break;
        
      case 'app_mention':
        await handleSlackMention(event.event);
        break;
        
      case 'team_join':
        await handleSlackTeamJoin(event.event);
        break;
        
      default:
        logger.info('Unhandled Slack webhook event', { type: event.event.type });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Slack webhook error', { error });
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// Stripe event handlers
const handlePaymentSuccess = async (paymentIntent: any) => {
  try {
    const { id, amount, currency, customer, metadata } = paymentIntent;
    
    // Find related order
    const orderId = metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          description: `Payment of ${amount / 100} ${currency.toUpperCase()} received`,
          entityType: 'ORDER',
          entityId: orderId,
          metadata: {
            paymentIntentId: id,
            amount: amount / 100,
            currency,
          },
        },
      });

      // Send confirmation email
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });

      if (order?.customer) {
        await sendEmail({
          to: order.customer.email,
          subject: 'Payment Confirmation',
          template: 'payment-success',
          data: {
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            amount: amount / 100,
            currency: currency.toUpperCase(),
            orderId,
          },
        });
      }
    }
    
    publishDashboardUpdate({ type: 'payment_received', amount });
  } catch (error) {
    logger.error('Payment success handler error', { error, paymentIntentId: paymentIntent.id });
  }
};

const handlePaymentFailed = async (paymentIntent: any) => {
  try {
    const { id, amount, currency, last_payment_error, metadata } = paymentIntent;
    
    const orderId = metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          updatedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'PAYMENT_FAILED',
          description: `Payment failed: ${last_payment_error?.message || 'Unknown error'}`,
          entityType: 'ORDER',
          entityId: orderId,
          metadata: {
            paymentIntentId: id,
            error: last_payment_error?.message,
            amount: amount / 100,
            currency,
          },
        },
      });

      // Notify customer service team
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true },
        select: { email: true, firstName: true, lastName: true },
      });

      await Promise.all(
        admins.map(admin =>
          sendEmail({
            to: admin.email,
            subject: 'Payment Failed - Action Required',
            template: 'payment-failed-admin',
            data: {
              adminName: `${admin.firstName} ${admin.lastName}`,
              orderId,
              amount: amount / 100,
              currency: currency.toUpperCase(),
              error: last_payment_error?.message,
            },
          })
        )
      );
    }
  } catch (error) {
    logger.error('Payment failed handler error', { error, paymentIntentId: paymentIntent.id });
  }
};

const handleSubscriptionCreated = async (subscription: any) => {
  try {
    const { id, customer, status, current_period_start, current_period_end } = subscription;
    
    // Create subscription record
    await prisma.subscription.create({
      data: {
        stripeSubscriptionId: id,
        customerId: customer,
        status: status.toUpperCase(),
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
      },
    });

    logger.info('Subscription created', { subscriptionId: id, customerId: customer });
  } catch (error) {
    logger.error('Subscription created handler error', { error, subscriptionId: subscription.id });
  }
};

const handleSubscriptionCancelled = async (subscription: any) => {
  try {
    const { id, canceled_at } = subscription;
    
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: id },
      data: {
        status: 'CANCELLED',
        cancelledAt: canceled_at ? new Date(canceled_at * 1000) : new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info('Subscription cancelled', { subscriptionId: id });
  } catch (error) {
    logger.error('Subscription cancelled handler error', { error, subscriptionId: subscription.id });
  }
};

const handleInvoicePaymentSuccess = async (invoice: any) => {
  try {
    const { id, customer, amount_paid, currency } = invoice;
    
    // Log activity
    await prisma.activity.create({
      data: {
        type: 'INVOICE_PAID',
        description: `Invoice payment of ${amount_paid / 100} ${currency.toUpperCase()} received`,
        metadata: {
          invoiceId: id,
          customerId: customer,
          amount: amount_paid / 100,
          currency,
        },
      },
    });

    publishDashboardUpdate({ type: 'invoice_paid', amount: amount_paid / 100 });
  } catch (error) {
    logger.error('Invoice payment success handler error', { error, invoiceId: invoice.id });
  }
};

// Zoom event handlers
const handleMeetingStarted = async (meeting: any) => {
  try {
    const { id, topic, host_id, start_time } = meeting;
    
    // Log meeting start
    await prisma.activity.create({
      data: {
        type: 'MEETING_STARTED',
        description: `Meeting "${topic}" started`,
        metadata: {
          meetingId: id,
          hostId: host_id,
          startTime: start_time,
          topic,
        },
      },
    });

    logger.info('Meeting started', { meetingId: id, topic });
  } catch (error) {
    logger.error('Meeting started handler error', { error, meetingId: meeting.id });
  }
};

const handleMeetingEnded = async (meeting: any) => {
  try {
    const { id, topic, duration, end_time } = meeting;
    
    // Log meeting end
    await prisma.activity.create({
      data: {
        type: 'MEETING_ENDED',
        description: `Meeting "${topic}" ended (${duration} minutes)`,
        metadata: {
          meetingId: id,
          duration,
          endTime: end_time,
          topic,
        },
      },
    });

    logger.info('Meeting ended', { meetingId: id, duration });
  } catch (error) {
    logger.error('Meeting ended handler error', { error, meetingId: meeting.id });
  }
};

const handleParticipantJoined = async (participant: any) => {
  try {
    const { id, user_name, join_time, meeting } = participant;
    
    // Log participant join
    await prisma.activity.create({
      data: {
        type: 'MEETING_PARTICIPANT_JOINED',
        description: `${user_name} joined meeting`,
        metadata: {
          participantId: id,
          userName: user_name,
          joinTime: join_time,
          meetingId: meeting?.id,
        },
      },
    });
  } catch (error) {
    logger.error('Participant joined handler error', { error });
  }
};

const handleRecordingCompleted = async (recording: any) => {
  try {
    const { id, topic, recording_files } = recording;
    
    // Store recording information
    for (const file of recording_files || []) {
      await prisma.meetingRecording.create({
        data: {
          meetingId: id,
          fileName: file.file_name,
          fileSize: file.file_size,
          downloadUrl: file.download_url,
          playUrl: file.play_url,
          recordingType: file.recording_type,
          createdAt: new Date(file.recording_start),
        },
      });
    }

    logger.info('Recording completed', { meetingId: id, fileCount: recording_files?.length || 0 });
  } catch (error) {
    logger.error('Recording completed handler error', { error, recordingId: recording.id });
  }
};

// Slack event handlers
const handleSlackMessage = async (message: any) => {
  try {
    const { text, user, ts, channel } = message;
    
    // Log Slack message (if it's relevant to CRM)
    if (text && text.toLowerCase().includes('crm')) {
      await prisma.activity.create({
        data: {
          type: 'SLACK_MESSAGE',
          description: `Slack message in CRM context: ${text.substring(0, 100)}...`,
          metadata: {
            slackUser: user,
            timestamp: ts,
            channel,
            message: text,
          },
        },
      });
    }
  } catch (error) {
    logger.error('Slack message handler error', { error });
  }
};

const handleSlackMention = async (mention: any) => {
  try {
    const { text, user } = mention;
    
    // Log app mention
    await prisma.activity.create({
      data: {
        type: 'SLACK_MENTION',
        description: `App mentioned in Slack: ${text}`,
        metadata: {
          slackUser: user,
          message: text,
        },
      },
    });
  } catch (error) {
    logger.error('Slack mention handler error', { error });
  }
};

const handleSlackTeamJoin = async (teamJoin: any) => {
  try {
    const { user } = teamJoin;
    
    // Log team join
    await prisma.activity.create({
      data: {
        type: 'SLACK_TEAM_JOIN',
        description: `New team member joined Slack workspace`,
        metadata: {
          slackUser: user,
        },
      },
    });
  } catch (error) {
    logger.error('Slack team join handler error', { error });
  }
};
