import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  invitationToken: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

// Helper function to generate JWT token
const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// @desc    Register user (with invitation only)
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { firstName, lastName, email, password, invitationToken } = value;

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token: invitationToken,
        status: 'PENDING',
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired invitation'
      });
    }

    if (invitation.email !== email) {
      return res.status(400).json({
        success: false,
        error: 'Email does not match invitation'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user and update invitation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          role: invitation.role,
          invitationId: invitation.id,
          isActive: true
        }
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date()
        }
      });

      return user;
    });

    // Generate JWT token
    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  // In a production app, you might want to maintain a blacklist of tokens
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email } = value;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent'
      });
    }

    // Generate reset token (in production, save this to database with expiry)
    const resetToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // TODO: Send email with reset link
    // For now, we'll just return the token (remove this in production)
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing forgot password request'
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { token, password } = value;

    // Verify token
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error resetting password'
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting user profile'
    });
  }
};

// ThirdWeb Wallet Authentication Schemas
const connectWalletSchema = Joi.object({
  address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  signature: Joi.string().required(),
  message: Joi.string().required()
});

const verifySignatureSchema = Joi.object({
  address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  signature: Joi.string().required(),
  message: Joi.string().required()
});

// Helper function to verify wallet signature
const verifySignature = async (address: string, signature: string, message: string): Promise<boolean> => {
  try {
    // In production, use ThirdWeb SDK to verify signature
    // For now, we'll do basic validation
    if (!address || !signature || !message) {
      return false;
    }
    
    // TODO: Implement proper signature verification with ThirdWeb SDK
    // const isValid = await verifyMessage({
    //   address,
    //   message,
    //   signature
    // });
    
    // For development, accept all signatures
    return process.env.NODE_ENV === 'development' || true;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// @desc    Connect wallet and authenticate
// @route   POST /api/v1/auth/connect-wallet
// @access  Public
export const connectWallet = async (req: Request, res: Response) => {
  try {
    const { error, value } = connectWalletSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { address, signature, message } = value;

    // Verify signature
    const isValidSignature = await verifySignature(address, signature, message);
    
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: 'Invalid wallet signature'
      });
    }

    // Find or create user by wallet address
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    let user;
    if (!existingUser) {
      // Create new user with wallet
      user = await prisma.user.create({
        data: {
          firstName: `User`,
          lastName: `${address.slice(0, 6)}...${address.slice(-4)}`,
          email: `${address}@wallet.local`, // Temporary email
          role: 'CLIENT',
          passwordHash: '', // Empty for wallet users
          walletAddress: address,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
    } else {
      // Update last login for existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: new Date() }
      });
      user = existingUser;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during wallet authentication'
    });
  }
};

// @desc    Verify wallet signature
// @route   POST /api/v1/auth/verify-signature
// @access  Public
export const verifyWalletSignature = async (req: Request, res: Response) => {
  try {
    const { error, value } = verifySignatureSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { address, signature, message } = value;

    const isValid = await verifySignature(address, signature, message);

    res.json({
      success: true,
      data: {
        isValid,
        address
      }
    });
  } catch (error: unknown) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Token verification failed' });
  }
};
