import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';

const prisma = new PrismaClient();

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    invitation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

describe('Invitation System', () => {
  let adminToken: string;
  let mockAdmin: any;
  let mockInvitation: any;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.BCRYPT_SALT_ROUNDS = '12';

    mockAdmin = {
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
      firstName: 'Admin',
      lastName: 'User'
    };

    mockInvitation = {
      id: 'invitation-123',
      email: 'newuser@example.com',
      role: 'CLIENT',
      token: 'invitation-token-123',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      invitedBy: mockAdmin.id
    };

    adminToken = jwt.sign(
      { userId: mockAdmin.id, email: mockAdmin.email, role: mockAdmin.role },
      process.env.JWT_SECRET!
    );

    jest.clearAllMocks();
  });

  describe('POST /api/v1/invitations', () => {
    it('should create invitation with admin role', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.invitation.create as jest.Mock).mockResolvedValue(mockInvitation);

      const response = await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@example.com',
          role: 'CLIENT'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.invitation).toEqual(
        expect.objectContaining({
          email: 'newuser@example.com',
          role: 'CLIENT',
          status: 'PENDING'
        })
      );

      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newuser@example.com',
          role: 'CLIENT',
          token: expect.any(String),
          expiresAt: expect.any(Date),
          invitedBy: mockAdmin.id
        })
      });
    });

    it('should reject invitation creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/invitations')
        .send({
          email: 'newuser@example.com',
          role: 'CLIENT'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject invitation creation with insufficient permissions', async () => {
      const clientUser = { ...mockAdmin, role: 'CLIENT' };
      const clientToken = jwt.sign(
        { userId: clientUser.id, email: clientUser.email, role: clientUser.role },
        process.env.JWT_SECRET!
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(clientUser);

      const response = await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          email: 'newuser@example.com',
          role: 'CLIENT'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Not authorized to access this resource');
    });

    it('should validate email format', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const response = await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          role: 'CLIENT'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should validate role', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const response = await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@example.com',
          role: 'INVALID_ROLE'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('role');
    });
  });

  describe('GET /api/v1/invitations', () => {
    it('should list invitations for admin', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue([mockInvitation]);

      const response = await request(app)
        .get('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.invitations).toHaveLength(1);
      expect(response.body.invitations[0]).toEqual(
        expect.objectContaining({
          email: 'newuser@example.com',
          role: 'CLIENT',
          status: 'PENDING'
        })
      );
    });

    it('should filter invitations by status', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue([mockInvitation]);

      const response = await request(app)
        .get('/api/v1/invitations?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(prisma.invitation.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('DELETE /api/v1/invitations/:id', () => {
    it('should delete invitation', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.invitation.delete as jest.Mock).mockResolvedValue(mockInvitation);

      const response = await request(app)
        .delete(`/api/v1/invitations/${mockInvitation.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prisma.invitation.delete).toHaveBeenCalledWith({
        where: { id: mockInvitation.id }
      });
    });

    it('should return 404 for non-existent invitation', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/invitations/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Invitation not found');
    });
  });
});

describe('Registration with Invitation', () => {
  let mockInvitation: any;
  let mockUser: any;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.BCRYPT_SALT_ROUNDS = '12';

    mockInvitation = {
      id: 'invitation-123',
      email: 'newuser@example.com',
      role: 'CLIENT',
      token: 'invitation-token-123',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };

    mockUser = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'newuser@example.com',
      role: 'CLIENT',
      isActive: true,
      invitationId: mockInvitation.id
    };

    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register user with valid invitation', async () => {
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockUser)
          },
          invitation: {
            update: jest.fn().mockResolvedValue({
              ...mockInvitation,
              status: 'ACCEPTED',
              acceptedAt: new Date()
            })
          }
        });
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          password: 'securepassword123',
          invitationToken: 'invitation-token-123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          role: 'CLIENT'
        })
      );
    });

    it('should reject registration with invalid invitation token', async () => {
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          password: 'securepassword123',
          invitationToken: 'invalid-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid or expired invitation');
    });

    it('should reject registration with expired invitation', async () => {
      const expiredInvitation = {
        ...mockInvitation,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };

      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(expiredInvitation);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          password: 'securepassword123',
          invitationToken: 'invitation-token-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid or expired invitation');
    });

    it('should reject registration with mismatched email', async () => {
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(mockInvitation);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'different@example.com',
          password: 'securepassword123',
          invitationToken: 'invitation-token-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email does not match invitation');
    });

    it('should reject registration for existing user', async () => {
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          password: 'securepassword123',
          invitationToken: 'invitation-token-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          // Missing lastName, email, password, invitationToken
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          password: '123', // Too short
          invitationToken: 'invitation-token-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('password');
    });
  });
});

describe('Login Flow', () => {
  let mockUser: any;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';

    mockUser = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      passwordHash: bcrypt.hashSync('password123', 12),
      role: 'CLIENT',
      isActive: true
    };

    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com',
          role: 'CLIENT'
        })
      );
    });

    it('should reject login with invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account is deactivated');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });
});
