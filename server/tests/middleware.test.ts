import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  authenticate,
  authorize,
  cache,
  invalidateCache,
  developmentLogger,
  requestId,
  performanceLogger,
  requirePermission,
  PermissionLevel
} from '../middleware';

const prisma = new PrismaClient();

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('Middleware Tests', () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Authentication Middleware', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret';
    });

    it('should authenticate valid token', async () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET!
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      app.get('/protected', authenticate, (req: any, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(mockUser);
    });

    it('should reject invalid token', async () => {
      app.get('/protected', authenticate, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject missing token', async () => {
      app.get('/protected', authenticate, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject inactive user', async () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET!
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false
      });

      app.get('/protected', authenticate, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Authorization Middleware', () => {
    beforeEach(() => {
      // Mock authenticated user
      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });
    });

    it('should authorize user with correct role', async () => {
      app.get('/admin', authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/admin');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject user with incorrect role', async () => {
      app.use((req: any, res, next) => {
        req.user = { ...mockUser, role: 'CLIENT' };
        next();
      });

      app.get('/admin', authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/admin');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Not authorized to access this resource');
    });

    it('should reject unauthenticated user', async () => {
      app.use((req: any, res, next) => {
        req.user = undefined;
        next();
      });

      app.get('/admin', authorize('ADMIN'), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/admin');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });
  });

  describe('Permission Middleware', () => {
    it('should allow public access', async () => {
      app.get('/public', requirePermission(PermissionLevel.PUBLIC), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/public');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should require authentication for non-public endpoints', async () => {
      app.get('/client', requirePermission(PermissionLevel.CLIENT), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/client');

      expect(response.status).toBe(401);
    });

    it('should allow access with sufficient permissions', async () => {
      app.use((req: any, res, next) => {
        req.user = { ...mockUser, role: 'ADMIN' };
        next();
      });

      app.get('/client', requirePermission(PermissionLevel.CLIENT), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/client');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Cache Middleware', () => {
    it('should cache GET requests', async () => {
      let callCount = 0;

      app.get('/cached', cache(60), (req, res) => {
        callCount++;
        res.json({ data: 'test', callCount });
      });

      // First request
      const response1 = await request(app).get('/cached');
      expect(response1.status).toBe(200);
      expect(response1.body.callCount).toBe(1);
      expect(response1.headers['x-cache']).toBe('MISS');

      // Second request should be cached
      const response2 = await request(app).get('/cached');
      expect(response2.status).toBe(200);
      expect(response2.body.callCount).toBe(1); // Same as first call
      expect(response2.headers['x-cache']).toBe('HIT');
    });

    it('should not cache non-GET requests', async () => {
      let callCount = 0;

      app.post('/not-cached', cache(60), (req, res) => {
        callCount++;
        res.json({ data: 'test', callCount });
      });

      // First request
      const response1 = await request(app).post('/not-cached');
      expect(response1.status).toBe(200);
      expect(response1.body.callCount).toBe(1);

      // Second request should not be cached
      const response2 = await request(app).post('/not-cached');
      expect(response2.status).toBe(200);
      expect(response2.body.callCount).toBe(2);
    });

    it('should invalidate cache on mutations', async () => {
      let getCallCount = 0;
      let postCallCount = 0;

      app.get('/data', cache(60), (req, res) => {
        getCallCount++;
        res.json({ data: 'test', callCount: getCallCount });
      });

      app.post('/data', invalidateCache(['GET:/data']), (req, res) => {
        postCallCount++;
        res.json({ success: true });
      });

      // First GET request
      const response1 = await request(app).get('/data');
      expect(response1.body.callCount).toBe(1);

      // Second GET request should be cached
      const response2 = await request(app).get('/data');
      expect(response2.body.callCount).toBe(1);

      // POST request to invalidate cache
      await request(app).post('/data');

      // Third GET request should not be cached
      const response3 = await request(app).get('/data');
      expect(response3.body.callCount).toBe(2);
    });
  });

  describe('Request ID Middleware', () => {
    it('should add request ID to request and response', async () => {
      app.use(requestId);
      app.get('/test', (req: any, res) => {
        res.json({ requestId: req.requestId });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.requestId).toBeDefined();
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should use provided request ID', async () => {
      const customRequestId = 'custom-request-id';

      app.use(requestId);
      app.get('/test', (req: any, res) => {
        res.json({ requestId: req.requestId });
      });

      const response = await request(app)
        .get('/test')
        .set('x-request-id', customRequestId);

      expect(response.status).toBe(200);
      expect(response.body.requestId).toBe(customRequestId);
      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });

  describe('Performance Logger Middleware', () => {
    it('should log slow requests', (done) => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      app.use(performanceLogger);
      app.get('/slow', (req, res) => {
        // Simulate slow response
        setTimeout(() => {
          res.json({ success: true });
        }, 1100); // > 1000ms threshold
      });

      request(app)
        .get('/slow')
        .end((err, res) => {
          expect(res.status).toBe(200);
          
          // Check if warning was logged after response
          setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
              'SLOW_REQUEST:',
              expect.objectContaining({
                method: 'GET',
                url: '/slow',
                duration: expect.stringMatching(/\d+ms/),
                statusCode: 200
              })
            );
            
            consoleSpy.mockRestore();
            done();
          }, 100);
        });
    });
  });
});
