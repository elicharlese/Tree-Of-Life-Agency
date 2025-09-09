import express from 'express';
import { 
  createPaymentIntent, 
  createSubscription, 
  getPaymentMethods, 
  generateInvoice, 
  handleWebhook 
} from '../controllers/stripeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Payment routes
router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/create-subscription', authenticate, createSubscription);
router.get('/payment-methods/:customerId', authenticate, getPaymentMethods);
router.post('/generate-invoice', authenticate, generateInvoice);

// Webhook endpoint - no authentication needed as Stripe handles verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
