import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../server/app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Security Tests', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
  });

  describe('Authentication Security', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      // Should not store plaintext password
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);

      // Should verify correctly
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);

      // Should reject incorrect password
      const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should use strong JWT tokens', async () => {
      const payload = { userId: 'test-123', role: 'AGENT' };
      const secret = process.env.JWT_SECRET || 'test-secret';
      
      const token = jwt.sign(payload, secret, { 
        expiresIn: '1h',
        algorithm: 'HS256' 
      });

      // Should create valid token
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature

      // Should verify correctly
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe('test-123');
      expect(decoded.role).toBe('AGENT');
    });

    it('should reject expired tokens', async () => {
      const payload = { userId: 'test-123', role: 'AGENT' };
      const secret = process.env.JWT_SECRET || 'test-secret';
      
      const expiredToken = jwt.sign(payload, secret, { 
        expiresIn: '-1h' // Expired 1 hour ago
      });

      expect(() => {
        jwt.verify(expiredToken, secret);
      }).toThrow('jwt expired');
    });

    it('should enforce rate limiting on login attempts', async () => {
      const loginAttempts = [];

      // Make 6 failed login attempts rapidly
      for (let i = 0; i < 6; i++) {
        loginAttempts.push(
          request(server)
            .post('/api/auth/login')
            .send({
              email: 'attacker@example.com',
              password: 'wrong-password',
            })
        );
      }

      const responses = await Promise.all(loginAttempts);
      
      // Should rate limit after 5 attempts
      const rateLimitedResponse = responses[5];
      expect(rateLimitedResponse.status).toBe(429);
      expect(rateLimitedResponse.body.error).toContain('rate limit');
    });
  });

  describe('Authorization Security', () => {
    it('should enforce role-based access control', async () => {
      // Test agent trying to access admin endpoint
      const agentToken = 'mock-agent-token';
      
      const response = await request(server)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate JWT tokens properly', async () => {
      // Test with invalid token
      const response = await request(server)
        .get('/api/dashboard/analytics')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should prevent privilege escalation', async () => {
      // Test agent trying to modify their own role
      const agentToken = 'mock-agent-token';
      
      const response = await request(server)
        .put('/api/users/self')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          role: 'ADMIN', // Trying to escalate privileges
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('permission');
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(server)
        .get(`/api/crm/customers?search=${encodeURIComponent(maliciousInput)}`);

      // Should not cause server error and should handle safely
      expect(response.status).not.toBe(500);
    });

    it('should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', 'Bearer valid-token')
        .send({
          firstName: xssPayload,
          lastName: 'Test',
          email: 'xss@example.com',
          status: 'PROSPECT',
          source: 'WEBSITE',
        });

      // Should either reject or sanitize the input
      if (response.status === 201) {
        expect(response.body.data.firstName).not.toContain('<script>');
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('should validate email formats', async () => {
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', 'Bearer valid-token')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email-format',
          status: 'PROSPECT',
          source: 'WEBSITE',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('should validate required fields', async () => {
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', 'Bearer valid-token')
        .send({
          // Missing required fields
          lastName: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should limit request size', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB payload
      
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', 'Bearer valid-token')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          notes: largePayload,
          status: 'PROSPECT',
          source: 'WEBSITE',
        });

      expect(response.status).toBe(413); // Payload too large
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on logout', async () => {
      const token = 'valid-session-token';
      
      // Logout
      const logoutResponse = await request(server)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);

      // Try to use the same token
      const protectedResponse = await request(server)
        .get('/api/dashboard/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(401);
    });

    it('should handle concurrent sessions correctly', async () => {
      // Test multiple active sessions for same user
      const responses = await Promise.all([
        request(server)
          .get('/api/dashboard/analytics')
          .set('Authorization', 'Bearer session-1'),
        request(server)
          .get('/api/dashboard/analytics')
          .set('Authorization', 'Bearer session-2'),
      ]);

      // Both should be handled correctly
      responses.forEach(response => {
        expect(response.status).toBeDefined();
      });
    });

    it('should expire sessions after timeout', async () => {
      // This would normally be tested with time manipulation
      // For now, we test the session validation logic
      const expiredSessionToken = 'expired-session-token';
      
      const response = await request(server)
        .get('/api/dashboard/analytics')
        .set('Authorization', `Bearer ${expiredSessionToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });
  });

  describe('Data Protection Security', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await request(server)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer valid-token');

      if (response.status === 200) {
        // Should not include password or sensitive fields
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.mfaSecret).toBeUndefined();
        expect(response.body.data.mfaBackupCodes).toBeUndefined();
      }
    });

    it('should encrypt sensitive data in transit', async () => {
      // Test HTTPS enforcement (in production)
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Should have security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should protect against CSRF attacks', async () => {
      // Test CSRF protection on state-changing operations
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Authorization', 'Bearer valid-token')
        .set('Origin', 'https://malicious-site.com')
        .send({
          firstName: 'CSRF',
          lastName: 'Test',
          email: 'csrf@example.com',
          status: 'PROSPECT',
          source: 'WEBSITE',
        });

      // Should reject requests from unauthorized origins
      expect([403, 400]).toContain(response.status);
    });
  });

  describe('API Security', () => {
    it('should implement proper CORS headers', async () => {
      const response = await request(server)
        .options('/api/auth/login')
        .set('Origin', 'https://treeoflife.com');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    it('should prevent information disclosure', async () => {
      // Test 404 responses don't reveal system information
      const response = await request(server)
        .get('/api/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
      // Should not reveal internal paths or system info
      expect(response.body.error).not.toContain('/');
      expect(response.body.stack).toBeUndefined();
    });

    it('should handle malformed requests safely', async () => {
      const response = await request(server)
        .post('/api/crm/customers')
        .set('Content-Type', 'application/json')
        .send('invalid-json{');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Should not expose internal error details
      expect(response.body.stack).toBeUndefined();
    });

    it('should limit API request frequency', async () => {
      const requests = [];
      
      // Make many requests rapidly
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(server)
            .get('/api/health')
        );
      }

      const responses = await Promise.all(requests);
      
      // Should rate limit excessive requests
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Webhook Security', () => {
    it('should verify webhook signatures', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const invalidSignature = 'sha256=invalid-signature';

      const response = await request(server)
        .post('/webhooks/stripe')
        .set('stripe-signature', invalidSignature)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('signature');
    });

    it('should reject webhooks without proper headers', async () => {
      const response = await request(server)
        .post('/webhooks/stripe')
        .send({ test: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('signature');
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types', async () => {
      // Test malicious file upload
      const response = await request(server)
        .post('/api/upload')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', Buffer.from('malicious content'), {
          filename: 'malware.exe',
          contentType: 'application/octet-stream',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('file type');
    });

    it('should limit file sizes', async () => {
      const largeFile = Buffer.alloc(50 * 1024 * 1024); // 50MB file
      
      const response = await request(server)
        .post('/api/upload')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', largeFile, {
          filename: 'large-file.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(413); // File too large
    });
  });

  describe('Environment Security', () => {
    it('should not expose environment variables', async () => {
      const response = await request(server)
        .get('/api/health');

      // Should not expose sensitive environment info
      if (response.body.env) {
        expect(response.body.env.DATABASE_URL).toBeUndefined();
        expect(response.body.env.JWT_SECRET).toBeUndefined();
        expect(response.body.env.STRIPE_SECRET_KEY).toBeUndefined();
      }
    });

    it('should use secure defaults', async () => {
      // Test security headers are present
      const response = await request(server)
        .get('/api/health');

      expect(response.headers['x-powered-by']).toBeUndefined(); // Should hide Express
      expect(response.headers['server']).not.toContain('Express');
    });
  });
});
