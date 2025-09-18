import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '../../libs/shared-backend/services/authService';
import { MFAService } from '../../libs/shared-backend/services/mfaService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        mfaEnabled: false,
        isActive: true,
        role: 'AGENT',
      };

      mockPrisma.user.findUnique.mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({
          id: '1',
          email: 'test@example.com',
        }),
        token: 'mock-token',
      });
    });

    it('should fail with invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.login('invalid@example.com', 'password');

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should require MFA when enabled', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        mfaEnabled: true,
        isActive: true,
        role: 'ADMIN',
      };

      mockPrisma.user.findUnique.mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual({
        success: false,
        requiresMFA: true,
        tempToken: expect.any(String),
      });
    });

    it('should fail for inactive users', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        mfaEnabled: false,
        isActive: false,
        role: 'AGENT',
      };

      mockPrisma.user.findUnique.mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual({
        success: false,
        error: 'Account is inactive',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockPayload = { userId: '1', role: 'AGENT', sessionId: 'session-1' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: '1',
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      const result = await authService.verifyToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should reject expired tokens', async () => {
      const mockPayload = { userId: '1', role: 'AGENT', sessionId: 'session-1' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: '1',
        isActive: true,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      });

      await expect(authService.verifyToken('expired-token')).rejects.toThrow('Session expired');
    });

    it('should reject inactive sessions', async () => {
      const mockPayload = { userId: '1', role: 'AGENT', sessionId: 'session-1' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: '1',
        isActive: false,
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(authService.verifyToken('inactive-session-token')).rejects.toThrow('Session inactive');
    });
  });

  describe('register', () => {
    it('should successfully register new user with valid invitation', async () => {
      const invitationData = {
        id: 'invitation-1',
        email: 'newuser@example.com',
        role: 'AGENT',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
      };

      mockPrisma.invitation.findUnique.mockResolvedValue(invitationData);
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const newUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'AGENT',
      };

      mockPrisma.user.create.mockResolvedValue(newUser);

      const result = await authService.register({
        invitationToken: 'valid-token',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      });

      expect(result).toEqual({
        success: true,
        user: newUser,
      });
    });

    it('should fail with expired invitation', async () => {
      const invitationData = {
        id: 'invitation-1',
        email: 'newuser@example.com',
        role: 'AGENT',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
      };

      mockPrisma.invitation.findUnique.mockResolvedValue(invitationData);

      const result = await authService.register({
        invitationToken: 'expired-token',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      });

      expect(result).toEqual({
        success: false,
        error: 'Invitation expired',
      });
    });

    it('should fail if user already exists', async () => {
      const invitationData = {
        id: 'invitation-1',
        email: 'existing@example.com',
        role: 'AGENT',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000),
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      };

      mockPrisma.invitation.findUnique.mockResolvedValue(invitationData);
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await authService.register({
        invitationToken: 'valid-token',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      });

      expect(result).toEqual({
        success: false,
        error: 'User already exists',
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout and invalidate session', async () => {
      mockPrisma.session.update.mockResolvedValue({
        id: 'session-1',
        isActive: false,
      });

      const result = await authService.logout('session-1');

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });

      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { isActive: false, updatedAt: expect.any(Date) },
      });
    });
  });
});

describe('MFAService', () => {
  let mfaService: MFAService;

  beforeEach(() => {
    mfaService = new MFAService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate MFA secret for user', async () => {
      const result = await mfaService.generateSecret('user-1');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(8);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid TOTP token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        mfaEnabled: true,
      });

      // Mock speakeasy verification
      jest.doMock('speakeasy', () => ({
        totp: {
          verify: jest.fn().mockReturnValue(true),
        },
      }));

      const result = await mfaService.verifyToken('user-1', '123456');

      expect(result).toBe(true);
    });

    it('should verify valid backup code', async () => {
      const backupCodes = ['abc123', 'def456', 'ghi789'];
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        mfaEnabled: true,
        mfaBackupCodes: backupCodes,
      });

      mockPrisma.user.update.mockResolvedValue({});

      const result = await mfaService.verifyBackupCode('user-1', 'abc123');

      expect(result).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          mfaBackupCodes: ['def456', 'ghi789'],
        },
      });
    });

    it('should reject invalid backup code', async () => {
      const backupCodes = ['abc123', 'def456', 'ghi789'];
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        mfaEnabled: true,
        mfaBackupCodes: backupCodes,
      });

      const result = await mfaService.verifyBackupCode('user-1', 'invalid');

      expect(result).toBe(false);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('enableMFA', () => {
    it('should enable MFA for user', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        mfaEnabled: true,
      });

      const result = await mfaService.enableMFA('user-1', 'valid-token');

      expect(result).toEqual({
        success: true,
        backupCodes: expect.any(Array),
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          mfaEnabled: true,
          mfaBackupCodes: expect.any(Array),
        },
      });
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA for user', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        mfaEnabled: false,
      });

      const result = await mfaService.disableMFA('user-1', 'valid-token');

      expect(result).toEqual({
        success: true,
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaBackupCodes: [],
        },
      });
    });
  });
});
