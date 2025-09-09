import { Request, Response } from 'express';
import { PrismaClient, UserRole, InvitationStatus } from '@prisma/client';
import crypto from 'crypto';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../../lib/email';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Validation schemas
const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'AGENT', 'CLIENT', 'DEVELOPER').required(),
  message: Joi.string().optional()
});

const acceptInvitationSchema = Joi.object({
  token: Joi.string().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(8).required()
});

// Send invitation (Admin/Super Admin only)
export const sendInvitation = async (req: Request, res: Response) => {
  try {
    const { error, value } = inviteUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, role } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'PENDING'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'Pending invitation already exists for this email' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        sentById: (req as any).user.id
      },
      include: {
        sentBy: true
      }
    });

    // For now, we'll skip email sending and return the token directly
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`;
    
    console.log(`Invitation created for ${email} with token: ${token}`);
    console.log(`Invite link: ${inviteLink}`);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all invitations (Admin/Super Admin only)
export const getInvitations = async (req: Request, res: Response) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, any> = {};
    
    if (status && typeof status === 'string') {
      where.status = status.toUpperCase();
    }
    
    if (role && typeof role === 'string') {
      where.role = role.toUpperCase();
    }

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        include: {
          sentBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.invitation.count({ where })
    ]);

    res.json({
      invitations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get invitation by token (Public)
export const getInvitationByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        sentBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        sentBy: invitation.sentBy,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Accept invitation (Public)
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { error, value } = acceptInvitationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, firstName, lastName, password } = value;

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and update invitation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          firstName,
          lastName,
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
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const jwtToken = jwt.sign(
      { id: result.id, email: result.email, role: result.role },
      jwtSecret
    );

    res.status(201).json({
      message: 'Invitation accepted successfully',
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
        isActive: result.isActive
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Resend invitation (Admin/Super Admin only)
export const resendInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { sentBy: true }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only resend pending invitations' });
    }

    // Generate new token and extend expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: { token, expiresAt },
      include: { sentBy: true }
    });

    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`;
    
    try {
      await sendEmail({
        to: updatedInvitation.email,
        subject: 'Invitation to Tree of Life Agency (Resent)',
        html: `
          <h2>You're invited to join Tree of Life Agency</h2>
          <p>Hello,</p>
          <p>${updatedInvitation.sentBy.firstName} ${updatedInvitation.sentBy.lastName} has invited you to join Tree of Life Agency as a ${updatedInvitation.role.toLowerCase().replace('_', ' ')}.</p>
          <p><a href="${inviteLink}">Accept Invitation</a></p>
          <p>This invitation will expire in 7 days.</p>
        `,
        text: `You're invited to join Tree of Life Agency. ${updatedInvitation.sentBy.firstName} ${updatedInvitation.sentBy.lastName} has invited you as a ${updatedInvitation.role.toLowerCase().replace('_', ' ')}. Accept at: ${inviteLink}`
      });
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
    }

    res.json({
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        expiresAt: updatedInvitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Revoke invitation (Admin/Super Admin only)
export const revokeInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only revoke pending invitations' });
    }

    await prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' }
    });

    res.json({ message: 'Invitation revoked successfully' });

  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get invitation statistics (Admin/Super Admin only)
export const getInvitationStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.invitation.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const roleStats = await prisma.invitation.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    const recentInvitations = await prisma.invitation.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      statusStats: stats.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      roleStats: roleStats.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
      recentInvitations
    });

  } catch (error) {
    console.error('Get invitation stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
