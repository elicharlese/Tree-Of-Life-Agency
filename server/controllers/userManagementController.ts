import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logger } from '../middleware/logging';
import { sendEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']),
  isActive: z.boolean().optional().default(true),
  sendWelcomeEmail: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']).optional(),
  isActive: z.boolean().optional(),
  profilePhoto: z.string().url().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

const bulkUserActionSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['activate', 'deactivate', 'delete']),
});

// Get all users with filtering and pagination
export const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          profilePhoto: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              assignedCustomers: true,
              assignedProjects: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    logger.error('Get users error', { error, query: req.query });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        profilePhoto: true,
        phone: true,
        bio: true,
        timezone: true,
        preferences: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedCustomers: true,
            assignedProjects: true,
            assignedLeads: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user by ID error', { error, userId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Create new user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const currentUserId = req.user?.userId;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        invitedBy: currentUserId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send welcome email with temporary password
    if (validatedData.sendWelcomeEmail) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Tree of Life Agency',
        template: 'user-welcome',
        data: {
          firstName: user.firstName,
          email: user.email,
          tempPassword,
          role: user.role,
          loginUrl: `${process.env.FRONTEND_URL}/auth/login`,
        },
      });
    }

    logger.info('User created successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdBy: currentUserId,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error) {
    logger.error('Create user error', { error, body: req.body });

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

// Update user (admin or self)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(currentUserRole || '');
    const isSelf = currentUserId === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    // If updating email, check for duplicates
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use',
        });
      }
    }

    // Restrict role changes for non-admins
    if (validatedData.role && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can change user roles',
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        profilePhoto: true,
        phone: true,
        bio: true,
        timezone: true,
        preferences: true,
        updatedAt: true,
      },
    });

    logger.info('User updated successfully', {
      userId: id,
      updatedBy: currentUserId,
      changes: Object.keys(validatedData),
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Update user error', { error, userId: req.params.id });

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

// Update own profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profilePhoto: true,
        phone: true,
        bio: true,
        timezone: true,
        preferences: true,
        updatedAt: true,
      },
    });

    logger.info('Profile updated successfully', { userId });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Update profile error', { error, userId: req.user?.userId });

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

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    // Prevent self-deletion
    if (currentUserId === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
        updatedAt: new Date(),
      },
    });

    logger.info('User deleted (deactivated)', {
      userId: id,
      email: user.email,
      deletedBy: currentUserId,
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error', { error, userId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Bulk user actions
export const bulkUserActions = async (req: Request, res: Response) => {
  try {
    const { userIds, action } = bulkUserActionSchema.parse(req.body);
    const currentUserId = req.user?.userId;

    // Prevent actions on self
    if (userIds.includes(currentUserId!)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot perform bulk actions on your own account',
      });
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true, updatedAt: new Date() };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false, updatedAt: new Date() };
        message = 'Users deactivated successfully';
        break;
      case 'delete':
        // Soft delete by deactivating and modifying email
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        });

        await Promise.all(
          users.map(user =>
            prisma.user.update({
              where: { id: user.id },
              data: {
                isActive: false,
                email: `deleted_${Date.now()}_${user.email}`,
                updatedAt: new Date(),
              },
            })
          )
        );

        message = 'Users deleted successfully';
        break;
    }

    if (action !== 'delete') {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: updateData,
      });
    }

    logger.info('Bulk user action completed', {
      action,
      userIds,
      performedBy: currentUserId,
    });

    res.json({
      success: true,
      message,
      data: {
        affectedUsers: userIds.length,
        action,
      },
    });
  } catch (error) {
    logger.error('Bulk user actions error', { error, body: req.body });

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

// Get user activity log
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get activity logs
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where: { userId: id },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          description: true,
          entityType: true,
          entityId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.activity.count({ where: { userId: id } }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        },
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    logger.error('Get user activity error', { error, userId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.$transaction([
      // Total users
      prisma.user.count(),
      // Active users
      prisma.user.count({ where: { isActive: true } }),
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Users with MFA enabled
      prisma.user.count({ where: { mfaEnabled: true } }),
    ]);

    const [totalUsers, activeUsers, usersByRole, newUsersThisMonth, usersWithMfa] = stats;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth,
        usersWithMfa,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    logger.error('Get user stats error', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
