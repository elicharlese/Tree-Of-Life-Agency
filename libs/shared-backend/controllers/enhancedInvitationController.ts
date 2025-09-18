import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../middleware/logging';
import { sendEmail, sendBulkEmails } from '../services/emailService';
import csv from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

// Validation schemas
const createInvitationSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']),
  message: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).default(7),
  template: z.string().optional().default('default'),
});

const bulkInvitationSchema = z.object({
  invitations: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']),
    message: z.string().optional(),
  })),
  template: z.string().optional().default('default'),
  expiresInDays: z.number().min(1).max(30).default(7),
});

const updateInvitationSchema = z.object({
  message: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  template: z.string().optional(),
});

// Role-based permissions for invitations
const getRolePermissions = (role: string) => {
  const permissions = {
    CLIENT: [
      'View and purchase services',
      'Manage personal profile',
      'Track order status',
      'Access client dashboard',
    ],
    AGENT: [
      'Manage assigned customers',
      'Create and track leads',
      'Access sales pipeline',
      'Generate reports',
      'Manage projects',
    ],
    ADMIN: [
      'Manage all users and agents',
      'Send invitations',
      'Access admin dashboard',
      'View analytics and reports',
      'Manage system settings',
    ],
    SUPER_ADMIN: [
      'Full system administration',
      'Manage admin users',
      'System configuration',
      'Security settings',
      'Data management',
    ],
    DEVELOPER: [
      'Full system access',
      'Database management',
      'API access',
      'System debugging',
      'Development tools',
    ],
  };
  
  return permissions[role as keyof typeof permissions] || [];
};

// Generate invitation token
const generateInvitationToken = (): string => {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
};

// Create single invitation
export const createInvitation = async (req: Request, res: Response) => {
  try {
    const validatedData = createInvitationSchema.parse(req.body);
    const inviterId = req.user?.userId;
    const inviterRole = req.user?.role;

    // Check if user can invite this role
    const roleHierarchy = { CLIENT: 1, AGENT: 2, ADMIN: 3, SUPER_ADMIN: 4, DEVELOPER: 5 };
    const inviterLevel = roleHierarchy[inviterRole as keyof typeof roleHierarchy] || 0;
    const inviteeLevel = roleHierarchy[validatedData.role as keyof typeof roleHierarchy] || 0;

    if (inviterLevel <= inviteeLevel && inviterRole !== 'DEVELOPER') {
      return res.status(403).json({
        success: false,
        error: 'Cannot invite users with equal or higher privileges',
      });
    }

    // Check if email already exists
    const [existingUser, existingInvitation] = await Promise.all([
      prisma.user.findUnique({ where: { email: validatedData.email } }),
      prisma.invitation.findFirst({
        where: {
          email: validatedData.email,
          status: 'PENDING',
        },
      }),
    ]);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        error: 'Pending invitation already exists for this email',
      });
    }

    // Create invitation
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    const invitation = await prisma.invitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
        token,
        expiresAt,
        invitedBy: inviterId!,
        message: validatedData.message,
        template: validatedData.template,
      },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get inviter details and role permissions
    const inviterName = `${invitation.inviter.firstName} ${invitation.inviter.lastName}`;
    const permissions = getRolePermissions(validatedData.role);
    const invitationUrl = `${process.env.FRONTEND_URL}/auth/register?token=${token}&email=${encodeURIComponent(validatedData.email)}`;

    // Send invitation email
    await sendEmail({
      to: validatedData.email,
      subject: `You're invited to join Tree of Life Agency as ${validatedData.role}`,
      template: 'invitation',
      data: {
        inviterName,
        inviterEmail: invitation.inviter.email,
        role: validatedData.role,
        message: validatedData.message,
        invitationUrl,
        expiresAt: expiresAt.toLocaleDateString(),
        permissions,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'INVITATION_SENT',
        description: `Invitation sent to ${validatedData.email} for role ${validatedData.role}`,
        userId: inviterId!,
        entityType: 'INVITATION',
        entityId: invitation.id,
        metadata: {
          email: validatedData.email,
          role: validatedData.role,
          template: validatedData.template,
        },
      },
    });

    logger.info('Invitation created and sent', {
      invitationId: invitation.id,
      email: validatedData.email,
      role: validatedData.role,
      invitedBy: inviterId,
    });

    res.status(201).json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        inviterName,
        createdAt: invitation.createdAt,
      },
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    logger.error('Create invitation error', { error, body: req.body });

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

// Bulk create invitations
export const createBulkInvitations = async (req: Request, res: Response) => {
  try {
    const validatedData = bulkInvitationSchema.parse(req.body);
    const inviterId = req.user?.userId;
    const inviterRole = req.user?.role;

    // Validate all invitations first
    const roleHierarchy = { CLIENT: 1, AGENT: 2, ADMIN: 3, SUPER_ADMIN: 4, DEVELOPER: 5 };
    const inviterLevel = roleHierarchy[inviterRole as keyof typeof roleHierarchy] || 0;

    for (const inv of validatedData.invitations) {
      const inviteeLevel = roleHierarchy[inv.role as keyof typeof roleHierarchy] || 0;
      if (inviterLevel <= inviteeLevel && inviterRole !== 'DEVELOPER') {
        return res.status(403).json({
          success: false,
          error: `Cannot invite users with role ${inv.role} - insufficient privileges`,
        });
      }
    }

    // Check for existing users and invitations
    const emails = validatedData.invitations.map(inv => inv.email);
    const [existingUsers, existingInvitations] = await Promise.all([
      prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      }),
      prisma.invitation.findMany({
        where: {
          email: { in: emails },
          status: 'PENDING',
        },
        select: { email: true },
      }),
    ]);

    const existingEmails = new Set([
      ...existingUsers.map(u => u.email),
      ...existingInvitations.map(i => i.email),
    ]);

    const validInvitations = validatedData.invitations.filter(
      inv => !existingEmails.has(inv.email)
    );

    if (validInvitations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'All emails already have users or pending invitations',
      });
    }

    // Create invitations
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    const invitationPromises = validInvitations.map(inv => {
      const token = generateInvitationToken();
      return prisma.invitation.create({
        data: {
          email: inv.email,
          role: inv.role,
          token,
          expiresAt,
          invitedBy: inviterId!,
          message: inv.message,
          template: validatedData.template,
        },
      });
    });

    const createdInvitations = await Promise.all(invitationPromises);

    // Get inviter details
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { firstName: true, lastName: true, email: true },
    });

    const inviterName = `${inviter!.firstName} ${inviter!.lastName}`;

    // Prepare bulk emails
    const emailPromises = createdInvitations.map(invitation => {
      const invData = validInvitations.find(inv => inv.email === invitation.email)!;
      const permissions = getRolePermissions(invData.role);
      const invitationUrl = `${process.env.FRONTEND_URL}/auth/register?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`;

      return {
        to: invitation.email,
        subject: `You're invited to join Tree of Life Agency as ${invData.role}`,
        template: 'invitation',
        data: {
          inviterName,
          inviterEmail: inviter!.email,
          role: invData.role,
          message: invData.message,
          invitationUrl,
          expiresAt: expiresAt.toLocaleDateString(),
          permissions,
        },
      };
    });

    // Send bulk emails
    await sendBulkEmails(emailPromises);

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'BULK_INVITATIONS_SENT',
        description: `Bulk invitations sent to ${createdInvitations.length} recipients`,
        userId: inviterId!,
        metadata: {
          invitationCount: createdInvitations.length,
          template: validatedData.template,
          roles: [...new Set(validInvitations.map(inv => inv.role))],
        },
      },
    });

    logger.info('Bulk invitations created and sent', {
      count: createdInvitations.length,
      invitedBy: inviterId,
      skipped: validatedData.invitations.length - validInvitations.length,
    });

    res.status(201).json({
      success: true,
      data: {
        sent: createdInvitations.length,
        skipped: validatedData.invitations.length - validInvitations.length,
        skippedEmails: Array.from(existingEmails).filter(email => emails.includes(email)),
        invitations: createdInvitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          expiresAt: inv.expiresAt,
        })),
      },
      message: `${createdInvitations.length} invitations sent successfully`,
    });
  } catch (error) {
    logger.error('Bulk create invitations error', { error, body: req.body });

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

// Import invitations from CSV
export const importInvitationsFromCSV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
      });
    }

    const csvData: any[] = [];
    const stream = Readable.from(req.file.buffer);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => csvData.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Validate CSV data
    const invitations = csvData.map((row, index) => {
      try {
        return {
          email: z.string().email().parse(row.email || row.Email),
          role: z.enum(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']).parse(row.role || row.Role),
          message: row.message || row.Message || undefined,
        };
      } catch (error) {
        throw new Error(`Invalid data in row ${index + 1}: ${error}`);
      }
    });

    // Process bulk invitations
    const result = await createBulkInvitations({
      ...req,
      body: {
        invitations,
        template: 'default',
        expiresInDays: 7,
      },
    }, res);

    return result;
  } catch (error) {
    logger.error('Import invitations from CSV error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to process CSV file',
    });
  }
};

// Get invitation analytics
export const getInvitationAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, role, inviterId } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Build where clause
    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    if (role) {
      where.role = role;
    }
    if (inviterId) {
      where.invitedBy = inviterId;
    }

    // Get analytics data
    const [
      totalInvitations,
      invitationsByStatus,
      invitationsByRole,
      conversionRate,
      recentActivity,
    ] = await Promise.all([
      // Total invitations
      prisma.invitation.count({ where }),
      
      // Invitations by status
      prisma.invitation.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      
      // Invitations by role
      prisma.invitation.groupBy({
        by: ['role'],
        where,
        _count: { role: true },
      }),
      
      // Conversion rate (accepted / total)
      prisma.$transaction([
        prisma.invitation.count({ where: { ...where, status: 'ACCEPTED' } }),
        prisma.invitation.count({ where }),
      ]),
      
      // Recent activity
      prisma.invitation.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          acceptedAt: true,
          inviter: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const [acceptedCount, totalCount] = conversionRate;
    const conversionPercentage = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalInvitations,
          conversionRate: Math.round(conversionPercentage * 100) / 100,
          acceptedInvitations: acceptedCount,
        },
        byStatus: invitationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        byRole: invitationsByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>),
        recentActivity: recentActivity.map(inv => ({
          ...inv,
          inviterName: `${inv.inviter.firstName} ${inv.inviter.lastName}`,
        })),
      },
    });
  } catch (error) {
    logger.error('Get invitation analytics error', { error, query: req.query });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Resend invitation
export const resendInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inviterId = req.user?.userId;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Can only resend pending invitations',
      });
    }

    // Generate new token and extend expiry
    const newToken = generateInvitationToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      },
    });

    // Resend email
    const inviterName = `${invitation.inviter.firstName} ${invitation.inviter.lastName}`;
    const permissions = getRolePermissions(invitation.role);
    const invitationUrl = `${process.env.FRONTEND_URL}/auth/register?token=${newToken}&email=${encodeURIComponent(invitation.email)}`;

    await sendEmail({
      to: invitation.email,
      subject: `Reminder: You're invited to join Tree of Life Agency as ${invitation.role}`,
      template: 'invitation',
      data: {
        inviterName,
        inviterEmail: invitation.inviter.email,
        role: invitation.role,
        message: invitation.message,
        invitationUrl,
        expiresAt: newExpiresAt.toLocaleDateString(),
        permissions,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'INVITATION_RESENT',
        description: `Invitation resent to ${invitation.email}`,
        userId: inviterId!,
        entityType: 'INVITATION',
        entityId: invitation.id,
        metadata: {
          email: invitation.email,
          role: invitation.role,
        },
      },
    });

    logger.info('Invitation resent', {
      invitationId: id,
      email: invitation.email,
      resentBy: inviterId,
    });

    res.json({
      success: true,
      data: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        role: updatedInvitation.role,
        status: updatedInvitation.status,
        expiresAt: updatedInvitation.expiresAt,
      },
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    logger.error('Resend invitation error', { error, invitationId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Revoke invitation
export const revokeInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inviterId = req.user?.userId;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Can only revoke pending invitations',
      });
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        status: 'REVOKED',
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'INVITATION_REVOKED',
        description: `Invitation revoked for ${invitation.email}`,
        userId: inviterId!,
        entityType: 'INVITATION',
        entityId: invitation.id,
        metadata: {
          email: invitation.email,
          role: invitation.role,
        },
      },
    });

    logger.info('Invitation revoked', {
      invitationId: id,
      email: invitation.email,
      revokedBy: inviterId,
    });

    res.json({
      success: true,
      data: updatedInvitation,
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    logger.error('Revoke invitation error', { error, invitationId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
