import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow(''),
  avatar: Joi.string().allow('')
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'CLIENT', 'DEVELOPER').required()
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, any> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          firstName: true,
        lastName: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              sentInvitations: true,
              assignedCustomers: true,
              assignedLeads: true,
              createdOrders: true,
              assignedOrders: true,
              createdProjects: true,
              assignedProjects: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private (Own profile or Admin)
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only access their own profile unless they're admin
    if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this profile'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sentInvitations: true,
            assignedCustomers: true,
            assignedLeads: true,
            createdOrders: true,
            assignedOrders: true,
            createdProjects: true,
            assignedProjects: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private (Own profile or Admin)
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile unless they're admin
    if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: value,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error: unknown) {
    console.error('Update user error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user!.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error, value } = updateRoleSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { role } = value;

    // Prevent admin from changing their own role
    if (req.user!.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error: unknown) {
    console.error('Update user role error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
