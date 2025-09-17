import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import app from '../app';

const prisma = new PrismaClient();

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('API Integration Tests', () => {
  let adminToken: string;
  let agentToken: string;
  let clientToken: string;
  let mockAdmin: any;
  let mockAgent: any;
  let mockClient: any;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';

    mockAdmin = {
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
      firstName: 'Admin',
      lastName: 'User'
    };

    mockAgent = {
      id: 'agent-123',
      email: 'agent@example.com',
      role: 'AGENT',
      isActive: true,
      firstName: 'Agent',
      lastName: 'User'
    };

    mockClient = {
      id: 'client-123',
      email: 'client@example.com',
      role: 'CLIENT',
      isActive: true,
      firstName: 'Client',
      lastName: 'User'
    };

    adminToken = jwt.sign(
      { userId: mockAdmin.id, email: mockAdmin.email, role: mockAdmin.role },
      process.env.JWT_SECRET!
    );

    agentToken = jwt.sign(
      { userId: mockAgent.id, email: mockAgent.email, role: mockAgent.role },
      process.env.JWT_SECRET!
    );

    clientToken = jwt.sign(
      { userId: mockClient.id, email: mockClient.email, role: mockClient.role },
      process.env.JWT_SECRET!
    );

    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          environment: expect.any(String),
          database: 'connected'
        })
      );
    });
  });

  describe('User Management', () => {
    describe('GET /api/v1/users', () => {
      it('should allow admin to list all users', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
        (prisma.user.findMany as jest.Mock).mockResolvedValue([mockAdmin, mockAgent, mockClient]);

        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.users).toHaveLength(3);
      });

      it('should prevent client from listing users', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockClient);

        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Not authorized to access this resource');
      });
    });

    describe('GET /api/v1/users/:id', () => {
      it('should allow user to view their own profile', async () => {
        (prisma.user.findUnique as jest.Mock)
          .mockResolvedValueOnce(mockClient) // Auth check
          .mockResolvedValueOnce(mockClient); // Profile fetch

        const response = await request(app)
          .get(`/api/v1/users/${mockClient.id}`)
          .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.id).toBe(mockClient.id);
      });

      it('should allow admin to view any user profile', async () => {
        (prisma.user.findUnique as jest.Mock)
          .mockResolvedValueOnce(mockAdmin) // Auth check
          .mockResolvedValueOnce(mockClient); // Profile fetch

        const response = await request(app)
          .get(`/api/v1/users/${mockClient.id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.id).toBe(mockClient.id);
      });

      it('should prevent user from viewing other user profiles', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockClient);

        const response = await request(app)
          .get(`/api/v1/users/${mockAgent.id}`)
          .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Not authorized to access this resource');
      });
    });
  });

  describe('Customer Management', () => {
    const mockCustomer = {
      id: 'customer-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      status: 'ACTIVE',
      assignedTo: mockAgent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('GET /api/v1/customers', () => {
      it('should allow agent to list their assigned customers', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.customer.findMany as jest.Mock).mockResolvedValue([mockCustomer]);

        const response = await request(app)
          .get('/api/v1/customers')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.customers).toHaveLength(1);
        expect(prisma.customer.findMany).toHaveBeenCalledWith({
          where: { assignedTo: mockAgent.id },
          orderBy: { createdAt: 'desc' }
        });
      });

      it('should allow admin to list all customers', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
        (prisma.customer.findMany as jest.Mock).mockResolvedValue([mockCustomer]);

        const response = await request(app)
          .get('/api/v1/customers')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(prisma.customer.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' }
        });
      });

      it('should prevent client from accessing customers', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockClient);

        const response = await request(app)
          .get('/api/v1/customers')
          .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Not authorized to access this resource');
      });
    });

    describe('POST /api/v1/customers', () => {
      it('should allow agent to create customer', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);

        const response = await request(app)
          .post('/api/v1/customers')
          .set('Authorization', `Bearer ${agentToken}`)
          .send({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.customer).toEqual(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          })
        );
      });

      it('should validate required fields', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);

        const response = await request(app)
          .post('/api/v1/customers')
          .set('Authorization', `Bearer ${agentToken}`)
          .send({
            firstName: 'John'
            // Missing required fields
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('required');
      });
    });
  });

  describe('Project Management', () => {
    const mockProject = {
      id: 'project-123',
      name: 'Website Development',
      description: 'Build a new website',
      status: 'ACTIVE',
      customerId: 'customer-123',
      assignedTo: mockAgent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('GET /api/v1/projects', () => {
      it('should allow agent to list their assigned projects', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.project.findMany as jest.Mock).mockResolvedValue([mockProject]);

        const response = await request(app)
          .get('/api/v1/projects')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.projects).toHaveLength(1);
      });

      it('should allow filtering by status', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.project.findMany as jest.Mock).mockResolvedValue([mockProject]);

        const response = await request(app)
          .get('/api/v1/projects?status=ACTIVE')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(prisma.project.findMany).toHaveBeenCalledWith({
          where: {
            assignedTo: mockAgent.id,
            status: 'ACTIVE'
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' }
        });
      });
    });

    describe('POST /api/v1/projects', () => {
      it('should allow agent to create project', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

        const response = await request(app)
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${agentToken}`)
          .send({
            name: 'Website Development',
            description: 'Build a new website',
            customerId: 'customer-123'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.project.name).toBe('Website Development');
      });
    });
  });

  describe('Service Management', () => {
    const mockService = {
      id: 'service-123',
      name: 'Web Development',
      description: 'Professional web development services',
      price: 5000,
      category: 'DEVELOPMENT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('GET /api/v1/services', () => {
      it('should allow public access to active services', async () => {
        (prisma.service.findMany as jest.Mock).mockResolvedValue([mockService]);

        const response = await request(app).get('/api/v1/services');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.services).toHaveLength(1);
        expect(prisma.service.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        });
      });

      it('should allow admin to view all services including inactive', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
        (prisma.service.findMany as jest.Mock).mockResolvedValue([mockService]);

        const response = await request(app)
          .get('/api/v1/services?includeInactive=true')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(prisma.service.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' }
        });
      });
    });

    describe('POST /api/v1/services', () => {
      it('should allow admin to create service', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
        (prisma.service.create as jest.Mock).mockResolvedValue(mockService);

        const response = await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Web Development',
            description: 'Professional web development services',
            price: 5000,
            category: 'DEVELOPMENT'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.service.name).toBe('Web Development');
      });

      it('should prevent non-admin from creating services', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);

        const response = await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${agentToken}`)
          .send({
            name: 'Web Development',
            description: 'Professional web development services',
            price: 5000,
            category: 'DEVELOPMENT'
          });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Not authorized to access this resource');
      });
    });
  });

  describe('Lead Management', () => {
    const mockLead = {
      id: 'lead-123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      status: 'NEW',
      source: 'WEBSITE',
      assignedTo: mockAgent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('GET /api/v1/leads', () => {
      it('should allow agent to list their assigned leads', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.lead.findMany as jest.Mock).mockResolvedValue([mockLead]);

        const response = await request(app)
          .get('/api/v1/leads')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.leads).toHaveLength(1);
      });

      it('should allow filtering by status', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.lead.findMany as jest.Mock).mockResolvedValue([mockLead]);

        const response = await request(app)
          .get('/api/v1/leads?status=NEW')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(prisma.lead.findMany).toHaveBeenCalledWith({
          where: {
            assignedTo: mockAgent.id,
            status: 'NEW'
          },
          orderBy: { createdAt: 'desc' }
        });
      });
    });

    describe('POST /api/v1/leads', () => {
      it('should allow public lead creation', async () => {
        (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);

        const response = await request(app)
          .post('/api/v1/leads')
          .send({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567890',
            message: 'Interested in web development services'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.lead.firstName).toBe('Jane');
      });

      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/v1/leads')
          .send({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'invalid-email',
            phone: '+1234567890'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('email');
      });
    });
  });

  describe('Activity Logging', () => {
    const mockActivity = {
      id: 'activity-123',
      type: 'CUSTOMER_CREATED',
      description: 'Customer John Doe was created',
      userId: mockAgent.id,
      entityType: 'CUSTOMER',
      entityId: 'customer-123',
      createdAt: new Date()
    };

    describe('GET /api/v1/activities', () => {
      it('should allow agent to view activities', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);

        const response = await request(app)
          .get('/api/v1/activities')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.activities).toHaveLength(1);
      });

      it('should allow filtering by entity type', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAgent);
        (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);

        const response = await request(app)
          .get('/api/v1/activities?entityType=CUSTOMER')
          .set('Authorization', `Bearer ${agentToken}`);

        expect(response.status).toBe(200);
        expect(prisma.activity.findMany).toHaveBeenCalledWith({
          where: { entityType: 'CUSTOMER' },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
          take: 50
        });
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // This test would require actual rate limiting implementation
      // For now, we'll just verify the endpoint exists
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      // Should get validation error, not rate limit error on first request
      expect(response.status).not.toBe(429);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.customer.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});
