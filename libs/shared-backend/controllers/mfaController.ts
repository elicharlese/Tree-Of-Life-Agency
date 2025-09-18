import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../middleware/logging';

const prisma = new PrismaClient();

// Validation schemas
const enableMfaSchema = z.object({
  token: z.string().length(6, 'MFA token must be 6 digits'),
});

const verifyMfaSchema = z.object({
  token: z.string().length(6, 'MFA token must be 6 digits'),
});

const disableMfaSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  token: z.string().length(6, 'MFA token must be 6 digits'),
});

// Generate MFA secret and QR code
export const generateMfaSecret = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mfaEnabled: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user role requires MFA
    const mfaRequiredRoles = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
    const isMfaRequired = mfaRequiredRoles.includes(user.role);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Tree of Life Agency (${user.email})`,
      issuer: 'Tree of Life Agency',
      length: 32,
    });

    // Store temporary secret (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaTempSecret: secret.base32,
      },
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    logger.info('MFA secret generated', { userId, email: user.email });

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        isRequired: isMfaRequired,
        isCurrentlyEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    logger.error('Generate MFA secret error', { error, userId: req.user?.userId });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Enable MFA after verifying token
export const enableMfa = async (req: Request, res: Response) => {
  try {
    const { token } = enableMfaSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get user with temp secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaTempSecret: true,
        mfaEnabled: true,
      },
    });

    if (!user || !user.mfaTempSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA setup not initiated. Please generate a secret first.',
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaTempSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of drift
    });

    if (!verified) {
      logger.warn('Invalid MFA token during enable attempt', { userId, email: user.email });
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA token. Please check your authenticator app.',
      });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Enable MFA and save secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: user.mfaTempSecret,
        mfaTempSecret: null,
        mfaBackupCodes: backupCodes,
        updatedAt: new Date(),
      },
    });

    logger.info('MFA enabled successfully', { userId, email: user.email });

    res.json({
      success: true,
      message: 'MFA has been enabled successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    logger.error('Enable MFA error', { error, userId: req.user?.userId });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Verify MFA token during login
export const verifyMfa = async (req: Request, res: Response) => {
  try {
    const { token } = verifyMfaSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get user MFA details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaBackupCodes: true,
      },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA is not enabled for this account',
      });
    }

    let verified = false;
    let usedBackupCode = false;

    // First try TOTP verification
    verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    // If TOTP fails, check backup codes
    if (!verified && user.mfaBackupCodes) {
      const backupCodes = user.mfaBackupCodes as string[];
      const codeIndex = backupCodes.indexOf(token.toUpperCase());
      
      if (codeIndex !== -1) {
        verified = true;
        usedBackupCode = true;
        
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((_, index) => index !== codeIndex);
        await prisma.user.update({
          where: { id: userId },
          data: {
            mfaBackupCodes: updatedBackupCodes,
          },
        });
      }
    }

    if (!verified) {
      logger.warn('Invalid MFA token during verification', { userId, email: user.email });
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA token',
      });
    }

    logger.info('MFA verification successful', { 
      userId, 
      email: user.email, 
      usedBackupCode 
    });

    res.json({
      success: true,
      message: 'MFA verification successful',
      data: {
        usedBackupCode,
        remainingBackupCodes: usedBackupCode ? 
          (user.mfaBackupCodes as string[]).length - 1 : 
          (user.mfaBackupCodes as string[]).length,
      },
    });
  } catch (error) {
    logger.error('Verify MFA error', { error, userId: req.user?.userId });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Disable MFA
export const disableMfa = async (req: Request, res: Response) => {
  try {
    const { password, token } = disableMfaSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        mfaEnabled: true,
        mfaSecret: true,
        role: true,
      },
    });

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is not enabled for this account',
      });
    }

    // Check if MFA is required for this role
    const mfaRequiredRoles = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
    if (mfaRequiredRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'MFA cannot be disabled for your role',
      });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Invalid password in MFA disable attempt', { userId, email: user.email });
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
      });
    }

    // Verify MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret!,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      logger.warn('Invalid MFA token during disable attempt', { userId, email: user.email });
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA token',
      });
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaTempSecret: null,
        mfaBackupCodes: null,
        updatedAt: new Date(),
      },
    });

    logger.info('MFA disabled successfully', { userId, email: user.email });

    res.json({
      success: true,
      message: 'MFA has been disabled successfully',
    });
  } catch (error) {
    logger.error('Disable MFA error', { error, userId: req.user?.userId });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get MFA status
export const getMfaStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaBackupCodes: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const mfaRequiredRoles = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
    const isRequired = mfaRequiredRoles.includes(user.role);

    res.json({
      success: true,
      data: {
        enabled: user.mfaEnabled,
        required: isRequired,
        backupCodesCount: user.mfaBackupCodes ? (user.mfaBackupCodes as string[]).length : 0,
      },
    });
  } catch (error) {
    logger.error('Get MFA status error', { error, userId: req.user?.userId });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Generate new backup codes
export const generateBackupCodes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
      },
    });

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is not enabled for this account',
      });
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Update backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaBackupCodes: backupCodes,
        updatedAt: new Date(),
      },
    });

    logger.info('New MFA backup codes generated', { userId, email: user.email });

    res.json({
      success: true,
      message: 'New backup codes generated successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    logger.error('Generate backup codes error', { error, userId: req.user?.userId });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
