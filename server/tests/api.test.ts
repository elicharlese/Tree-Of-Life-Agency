import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'CLIENT'
};

const testCustomer = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  company: 'Test Company'
};

const testOrder = {
  customerId: '',
  services: ['Web Development', 'API Integration'],
  totalAmount: 5000,
  currency: 'USD',
  status: 'PENDING'
};

let authToken: string;
let customerId: string;
let orderId: string;

describe('API Comprehensive Testing', () => {
  beforeAll(async () => {
    // Set test environment to disable rate limiting
    (process.env as any).NODE_ENV = 'test';
    
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.customer.deleteMany({
      where: { email: testCustomer.email }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.customer.deleteMany({
      where: { email: testCustomer.email }
    });
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
      
      authToken = response.body.token;
    });

    it('should not register user with duplicate email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not login with invalid credentials', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not access profile without token', async () => {
      await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);
    });
  });

  describe('Customer Management Endpoints', () => {
    it('should create a new customer', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCustomer)
        .expect(201);

      expect(response.body).toHaveProperty('customer');
      expect(response.body.customer.email).toBe(testCustomer.email);
      
      customerId = response.body.customer.id;
    });

    it('should get all customers', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('customers');
      expect(Array.isArray(response.body.customers)).toBe(true);
    });

    it('should get customer by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.customer.id).toBe(customerId);
      expect(response.body.customer.email).toBe(testCustomer.email);
    });

    it('should update customer', async () => {
      const updateData = { company: 'Updated Company' };
      
      const response = await request(app)
        .put(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.customer.company).toBe(updateData.company);
    });
  });

  describe('Order Management Endpoints', () => {
    it('should create a new order', async () => {
      testOrder.customerId = customerId;
      
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testOrder)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.customerId).toBe(customerId);
      
      orderId = response.body.order.id;
    });

    it('should get all orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    it('should get order by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.order.id).toBe(orderId);
    });

    it('should update order status', async () => {
      const updateData = { status: 'APPROVED' };
      
      const response = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.order.status).toBe(updateData.status);
    });
  });

  describe('Order Processing Endpoints', () => {
    it('should initialize project from order', async () => {
      const response = await request(app)
        .post(`/api/v1/orders/${orderId}/initialize-project`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('project');
      expect(response.body.project.orderId).toBe(orderId);
    });

    it('should get project timeline', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('timeline');
      expect(response.body).toHaveProperty('milestones');
    });

    it('should get budget status', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}/budget-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalBudget');
      expect(response.body).toHaveProperty('spentAmount');
      expect(response.body).toHaveProperty('remainingBudget');
    });
  });

  describe('Payment Endpoints', () => {
    it('should create payment intent', async () => {
      const paymentData = {
        orderId,
        amount: 5000,
        currency: 'usd',
        description: 'Test payment'
      };

      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentIntentId');
    });

    it('should create subscription', async () => {
      const subscriptionData = {
        customerId,
        priceId: 'price_test_123',
        paymentMethodId: 'pm_test_123'
      };

      const response = await request(app)
        .post('/api/v1/payments/create-subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('subscriptionId');
    });

    it('should get payment methods', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/payment-methods/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentMethods');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit authentication endpoints', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@test.com', password: 'wrong' })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/v1/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle unauthorized access', async () => {
      await request(app)
        .get('/api/v1/customers')
        .expect(401);
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const incompleteUser = { email: 'test2@example.com' };
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(incompleteUser)
        .expect(400);
    });

    it('should validate password strength', async () => {
      const weakPasswordUser = { ...testUser, email: 'test3@example.com', password: '123' };
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(weakPasswordUser)
        .expect(400);
    });
  });
});
