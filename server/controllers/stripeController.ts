import { Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, emailTemplates } from '../../lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

const prisma = new PrismaClient();

// Validation schemas
const createPaymentIntentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('usd'),
  description: Joi.string().allow('')
});

const createSubscriptionSchema = Joi.object({
  customerId: Joi.string().required(),
  priceId: Joi.string().required(),
  metadata: Joi.object().allow(null)
});

const webhookSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.object().required()
});

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fix Stripe integration - missing stripeCustomerId field in Customer schema
    res.status(501).json({
      success: false,
      error: 'Stripe integration temporarily disabled - schema updates required'
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
};

// @desc    Create subscription
// @route   POST /api/v1/payments/create-subscription
// @access  Private
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fix Stripe integration - missing stripeCustomerId field in Customer schema
    res.status(501).json({
      success: false,
      error: 'Stripe integration temporarily disabled - schema updates required'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
};

// @desc    Get payment methods for customer
// @route   GET /api/v1/payments/payment-methods/:customerId
// @access  Private
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fix Stripe integration - missing stripeCustomerId field in Customer schema
    res.status(501).json({
      success: false,
      error: 'Stripe integration temporarily disabled - schema updates required'
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
};

// @desc    Generate invoice
// @route   POST /api/v1/payments/generate-invoice
// @access  Private
export const generateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Only admin can generate invoices
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate invoices'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = order.customer.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: order.customer.email,
        name: order.customer.name,
        metadata: {
          customerId: order.customer.id
        }
      });
      
      stripeCustomerId = stripeCustomer.id;
      
      await prisma.customer.update({
        where: { id: order.customer.id },
        data: { stripeCustomerId }
      });
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      metadata: {
        orderId: order.id,
        customerId: order.customer.id
      },
      description: `Invoice for ${order.projectName}`,
      auto_advance: false // Don't auto-finalize
    });

    // Add invoice item
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'usd',
      description: order.description || 'Order payment'
    });

    // Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id!);

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'order',
        entityId: order.id,
        type: 'invoice_generated',
        title: 'Invoice Generated',
        description: `Invoice generated for order ${order.orderNumber}`,
        userId: req.user!.id,
        customerId: order.customerId,
        orderId: order.id
      }
    });

    res.json({
      success: true,
      data: {
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        invoicePdf: finalizedInvoice.invoice_pdf,
        status: finalizedInvoice.status,
        amount: finalizedInvoice.amount_due / 100
      }
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating invoice'
    });
  }
};

// @desc    Handle Stripe webhooks
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe)
export const handleWebhook = async (req: any, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};

// Webhook event handlers
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (orderId) {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'CONFIRMED',
          paidAt: new Date()
        }
      });

      // Get order details for email
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true }
      });

      if (order) {
        // Log activity
        await prisma.activity.create({
          data: {
            entityType: 'order',
            entityId: order.id,
            type: 'payment_succeeded',
            title: 'Payment Successful',
            description: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} completed`,
            customerId: order.customerId,
            orderId: order.id,
            userId: 'system' // System-generated activity
          }
        });

        // Send confirmation email
        try {
          const template = emailTemplates.orderConfirmation(
            order.orderNumber,
            order.customer.name,
            order.projectName,
            Number(order.totalAmount)
          );
          
          await sendEmail({
            to: order.customer.email,
            subject: template.subject,
            html: template.html,
            text: template.text
          });
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (orderId) {
      // Log activity
      await prisma.activity.create({
        data: {
          entityType: 'order',
          entityId: orderId,
          type: 'payment_failed',
          title: 'Payment Failed',
          description: `Payment attempt failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
          customerId: paymentIntent.metadata.customerId,
          orderId,
          userId: 'system' // System-generated activity
        }
      });
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  try {
    const orderId = invoice.metadata?.orderId;
    
    if (orderId) {
      await prisma.activity.create({
        data: {
          entityType: 'order',
          entityId: orderId,
          type: 'invoice_paid',
          title: 'Invoice Paid',
          description: `Invoice payment of $${(invoice.amount_paid || 0) / 100} received`,
          customerId: invoice.metadata?.customerId,
          orderId,
          userId: 'system' // System-generated activity
        }
      });
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
};

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.metadata?.customerId;
    
    if (customerId) {
      await prisma.activity.create({
        data: {
          entityType: 'customer',
          entityId: customerId,
          type: 'subscription_created',
          title: 'Subscription Created',
          description: `New subscription created: ${subscription.id}`,
          customerId,
          userId: 'system' // System-generated activity
        }
      });
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.metadata?.customerId;
    
    if (customerId) {
      await prisma.activity.create({
        data: {
          entityType: 'customer',
          entityId: customerId,
          type: 'subscription_updated',
          title: 'Subscription Updated',
          description: `Subscription updated: ${subscription.status}`,
          customerId,
          userId: 'system' // System-generated activity
        }
      });
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.metadata?.customerId;
    
    if (customerId) {
      await prisma.activity.create({
        data: {
          entityType: 'customer',
          entityId: customerId,
          type: 'subscription_cancelled',
          title: 'Subscription Cancelled',
          description: `Subscription cancelled: ${subscription.id}`,
          customerId,
          userId: 'system' // System-generated activity
        }
      });
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
};
