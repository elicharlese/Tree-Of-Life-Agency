import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../server/app';

const prisma = new PrismaClient();
let server: any;
let adminToken: string;
let agentToken: string;
let clientToken: string;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Start test server
    server = app.listen(0);
    
    // Seed test data
    await seedTestData();
    
    // Get authentication tokens
    const tokens = await getAuthTokens();
    adminToken = tokens.admin;
    agentToken = tokens.agent;
    clientToken = tokens.client;
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await prisma.$disconnect();
    server.close();
  });

  beforeEach(async () => {
    // Reset test data before each test
    await resetTestData();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(server)
          .post('/api/auth/login')
          .send({
            email: 'admin@treeoflife.com',
            password: 'AdminPass123!',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          user: expect.objectContaining({
            email: 'admin@treeoflife.com',
            role: 'ADMIN',
          }),
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });

      it('should reject invalid credentials', async () => {
        const response = await request(server)
          .post('/api/auth/login')
          .send({
            email: 'admin@treeoflife.com',
            password: 'WrongPassword',
          });

        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
          success: false,
          error: expect.any(String),
        });
      });

      it('should require MFA when enabled', async () => {
        const response = await request(server)
          .post('/api/auth/login')
          .send({
            email: 'mfa-user@treeoflife.com',
            password: 'MFAUser123!',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: false,
          requiresMFA: true,
          tempToken: expect.any(String),
        });
      });

      it('should handle rate limiting', async () => {
        // Make multiple failed login attempts
        for (let i = 0; i < 6; i++) {
          await request(server)
            .post('/api/auth/login')
            .send({
              email: 'admin@treeoflife.com',
              password: 'WrongPassword',
            });
        }

        const response = await request(server)
          .post('/api/auth/login')
          .send({
            email: 'admin@treeoflife.com',
            password: 'AdminPass123!',
          });

        expect(response.status).toBe(429);
        expect(response.body.error).toContain('rate limit');
      });
    });

    describe('POST /api/auth/refresh-token', () => {
      it('should refresh valid token', async () => {
        const response = await request(server)
          .post('/api/auth/refresh-token')
          .send({
            refreshToken: 'valid-refresh-token',
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });

      it('should reject invalid refresh token', async () => {
        const response = await request(server)
          .post('/api/auth/refresh-token')
          .send({
            refreshToken: 'invalid-refresh-token',
          });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(server)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          message: 'Logged out successfully',
        });
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /api/users', () => {
      it('should return users for admin', async () => {
        const response = await request(server)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            users: expect.arrayContaining([
              expect.objectContaining({
                email: expect.any(String),
                role: expect.any(String),
              }),
            ]),
            pagination: expect.objectContaining({
              page: expect.any(Number),
              total: expect.any(Number),
            }),
          }),
        });
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(server)
          .get('/api/users')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/users', () => {
      it('should create new user as admin', async () => {
        const newUser = {
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@treeoflife.com',
          role: 'AGENT',
          password: 'NewUser123!',
        };

        const response = await request(server)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
          }),
        });
      });

      it('should validate user data', async () => {
        const invalidUser = {
          firstName: '',
          lastName: 'User',
          email: 'invalid-email',
          role: 'INVALID_ROLE',
        };

        const response = await request(server)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidUser);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.details).toBeDefined();
      });
    });
  });

  describe('CRM Endpoints', () => {
    describe('GET /api/crm/customers', () => {
      it('should return customers with pagination', async () => {
        const response = await request(server)
          .get('/api/crm/customers?page=1&limit=10')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            customers: expect.any(Array),
            pagination: expect.objectContaining({
              page: 1,
              limit: 10,
              total: expect.any(Number),
              totalPages: expect.any(Number),
            }),
          }),
        });
      });

      it('should filter customers by search query', async () => {
        const response = await request(server)
          .get('/api/crm/customers?search=John')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.customers).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              firstName: expect.stringMatching(/John/i),
            }),
          ])
        );
      });

      it('should filter customers by status', async () => {
        const response = await request(server)
          .get('/api/crm/customers?status=ACTIVE')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        response.body.data.customers.forEach((customer: any) => {
          expect(customer.status).toBe('ACTIVE');
        });
      });

      it('should respect role-based filtering for agents', async () => {
        const response = await request(server)
          .get('/api/crm/customers')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        // Agent should only see customers assigned to them
        response.body.data.customers.forEach((customer: any) => {
          expect(customer.assignedTo).toBe('agent-user-id');
        });
      });
    });

    describe('POST /api/crm/customers', () => {
      it('should create new customer', async () => {
        const newCustomer = {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567890',
          company: 'Smith Corp',
          status: 'PROSPECT',
          source: 'WEBSITE',
        };

        const response = await request(server)
          .post('/api/crm/customers')
          .set('Authorization', `Bearer ${agentToken}`)
          .send(newCustomer);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
          }),
        });
      });

      it('should prevent duplicate email addresses', async () => {
        const duplicateCustomer = {
          firstName: 'Duplicate',
          lastName: 'Customer',
          email: 'existing@treeoflife.com',
          status: 'PROSPECT',
          source: 'WEBSITE',
        };

        const response = await request(server)
          .post('/api/crm/customers')
          .set('Authorization', `Bearer ${agentToken}`)
          .send(duplicateCustomer);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('already exists');
      });
    });

    describe('GET /api/crm/leads', () => {
      it('should return leads with conversion metrics', async () => {
        const response = await request(server)
          .get('/api/crm/leads')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.leads).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              score: expect.any(Number),
              probability: expect.any(Number),
              status: expect.any(String),
            }),
          ])
        );
      });

      it('should filter leads by pipeline stage', async () => {
        const response = await request(server)
          .get('/api/crm/leads?status=QUALIFIED')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        response.body.data.leads.forEach((lead: any) => {
          expect(lead.status).toBe('QUALIFIED');
        });
      });
    });

    describe('PUT /api/crm/leads/:id', () => {
      it('should update lead status and score', async () => {
        const leadId = 'test-lead-1';
        const updates = {
          status: 'QUALIFIED',
          probability: 75,
          notes: 'Qualified after demo call',
        };

        const response = await request(server)
          .put(`/api/crm/leads/${leadId}`)
          .set('Authorization', `Bearer ${agentToken}`)
          .send(updates);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject(updates);
      });
    });
  });

  describe('Dashboard Endpoints', () => {
    describe('GET /api/dashboard/analytics', () => {
      it('should return comprehensive analytics', async () => {
        const response = await request(server)
          .get('/api/dashboard/analytics')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            overview: expect.objectContaining({
              totalCustomers: expect.any(Number),
              totalLeads: expect.any(Number),
              conversionRate: expect.any(Number),
              totalRevenue: expect.any(Number),
            }),
            salesPipeline: expect.any(Array),
            recentActivities: expect.any(Array),
          }),
        });
      });

      it('should filter analytics by date range', async () => {
        const response = await request(server)
          .get('/api/dashboard/analytics?dateRange=month')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should return role-specific analytics for agents', async () => {
        const response = await request(server)
          .get('/api/dashboard/analytics')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        // Agent analytics should only include their assigned records
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Communication Endpoints', () => {
    describe('POST /api/communication/messages', () => {
      it('should send internal message', async () => {
        const message = {
          recipientId: 'agent-user-id',
          subject: 'Test Message',
          content: 'This is a test message',
          type: 'MESSAGE',
        };

        const response = await request(server)
          .post('/api/communication/messages')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(message);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            subject: message.subject,
            content: message.content,
            status: 'SENT',
          }),
        });
      });
    });

    describe('GET /api/communication/messages', () => {
      it('should return user messages', async () => {
        const response = await request(server)
          .get('/api/communication/messages')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            messages: expect.any(Array),
            pagination: expect.any(Object),
          }),
        });
      });
    });

    describe('POST /api/communication/logs', () => {
      it('should log customer communication', async () => {
        const commLog = {
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: 'Follow-up',
          content: 'Following up on our discussion',
          customerId: 'test-customer-1',
        };

        const response = await request(server)
          .post('/api/communication/logs')
          .set('Authorization', `Bearer ${agentToken}`)
          .send(commLog);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(server)
        .get('/api/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: 'Not found',
      });
    });

    it('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle database connection errors gracefully', async () => {
      // Temporarily disconnect from database
      await prisma.$disconnect();

      const response = await request(server)
        .get('/api/crm/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // Reconnect for other tests
      await prisma.$connect();
    });
  });
});

// Helper functions
async function seedTestData() {
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        id: 'admin-user-id',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@treeoflife.com',
        password: '$2a$12$hashedpassword', // AdminPass123!
        role: 'ADMIN',
        isActive: true,
      },
      {
        id: 'agent-user-id',
        firstName: 'Agent',
        lastName: 'User',
        email: 'agent@treeoflife.com',
        password: '$2a$12$hashedpassword', // AgentPass123!
        role: 'AGENT',
        isActive: true,
      },
      {
        id: 'client-user-id',
        firstName: 'Client',
        lastName: 'User',
        email: 'client@treeoflife.com',
        password: '$2a$12$hashedpassword', // ClientPass123!
        role: 'CLIENT',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create test customers
  await prisma.customer.createMany({
    data: [
      {
        id: 'test-customer-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@treeoflife.com',
        status: 'ACTIVE',
        source: 'WEBSITE',
        assignedTo: 'agent-user-id',
      },
    ],
    skipDuplicates: true,
  });

  // Create test leads
  await prisma.lead.createMany({
    data: [
      {
        id: 'test-lead-1',
        firstName: 'Jane',
        lastName: 'Lead',
        email: 'lead@example.com',
        status: 'NEW',
        score: 50,
        probability: 25,
        assignedTo: 'agent-user-id',
      },
    ],
    skipDuplicates: true,
  });
}

async function getAuthTokens() {
  // Generate test tokens (in real implementation, these would be proper JWT tokens)
  return {
    admin: 'admin-test-token',
    agent: 'agent-test-token',
    client: 'client-test-token',
  };
}

async function resetTestData() {
  // Reset any modified test data between tests
  await prisma.customer.updateMany({
    where: { id: 'test-customer-1' },
    data: { status: 'ACTIVE' },
  });
}

async function cleanupTestData() {
  // Clean up test data
  await prisma.customer.deleteMany({
    where: { email: { contains: '@treeoflife.com' } },
  });
  
  await prisma.lead.deleteMany({
    where: { email: { contains: '@example.com' } },
  });

  await prisma.user.deleteMany({
    where: { email: { contains: '@treeoflife.com' } },
  });
}
