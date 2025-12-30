import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/server/middleware/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    });

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, currency = 'usd', description } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: user.id
      },
      include: {
        customer: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = order.customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: order.customer.email,
        name: order.customer.name,
        metadata: {
          userId: order.customer.id
        }
      });
      
      stripeCustomerId = stripeCustomer.id;
      
      // Update customer with Stripe ID
      await prisma.customer.update({
        where: { id: order.customer.id },
        data: { stripeCustomerId }
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      description: description || `Payment for order ${order.orderNumber}`,
      metadata: {
        orderId: order.id,
        userId: user.id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'order',
        entityId: order.id,
        type: 'payment_intent_created',
        title: 'Payment Intent Created',
        description: `Payment intent created for $${amount}`,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
