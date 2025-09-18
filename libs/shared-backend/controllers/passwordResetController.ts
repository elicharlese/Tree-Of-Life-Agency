import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { sendEmail } from '../services/emailService';
import { logger } from '../middleware/logging';

const prisma = new PrismaClient();

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Generate secure reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Forgot password - send reset email
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.warn('Password reset attempted for non-existent email', { email });
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Password reset attempted for inactive user', { userId: user.id, email });
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token and expiration (1 hour)
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Tree of Life Agency - Password Reset Request',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        expiresIn: '1 hour',
      },
    });

    logger.info('Password reset email sent', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error', { error, body: req.body });
    
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

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Token not expired
        },
        isActive: true,
      },
    });

    if (!user) {
      logger.warn('Invalid or expired reset token used', { token });
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date(),
      },
    });

    // Log successful password reset
    logger.info('Password reset successful', { userId: user.id, email: user.email });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Tree of Life Agency - Password Reset Successful',
      template: 'password-reset-confirmation',
      data: {
        firstName: user.firstName,
        resetTime: new Date().toLocaleString(),
      },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error', { error, body: req.body });
    
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

// Change password (authenticated user)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      logger.warn('Invalid current password in change password attempt', { userId });
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password',
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    logger.info('Password changed successfully', { userId, email: user.email });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Tree of Life Agency - Password Changed',
      template: 'password-change-confirmation',
      data: {
        firstName: user.firstName,
        changeTime: new Date().toLocaleString(),
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error', { error, userId: req.user?.userId });
    
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

// Validate reset token
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Reset token is required',
      });
    }

    // Check if token exists and is not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        resetTokenExpires: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
        expiresAt: user.resetTokenExpires,
      },
    });
  } catch (error) {
    logger.error('Validate reset token error', { error, token: req.params.token });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
``