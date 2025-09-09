import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createActivitySchema = Joi.object({
  entityType: Joi.string().valid('customer', 'lead', 'order', 'project', 'milestone').required(),
  entityId: Joi.string().required(),
  type: Joi.string().valid('call', 'email', 'meeting', 'note', 'status_change', 'created', 'updated', 'deleted', 'assigned', 'completed').required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  customerId: Joi.string().allow(''),
  leadId: Joi.string().allow(''),
  orderId: Joi.string().allow(''),
  projectId: Joi.string().allow(''),
  milestoneId: Joi.string().allow('')
});

const updateActivitySchema = Joi.object({
  type: Joi.string().valid('call', 'email', 'meeting', 'note', 'status_change', 'created', 'updated', 'deleted', 'assigned', 'completed'),
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow('')
});

// @desc    Get all activities
// @route   GET /api/v1/activities
// @access  Private
export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search, entityType, type, userId, customerId, leadId, orderId, projectId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, any> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Non-admin users can only see activities they created or are related to their entities
    if (req.user!.role !== 'ADMIN') {
      where.OR = [
        { userId: req.user!.id },
        // Activities related to their orders (for clients)
        ...(req.user!.role === 'CLIENT' ? [{
          order: { userId: req.user!.id }
        }] : []),
        // Activities related to their assigned projects (for developers)
        ...(req.user!.role === 'DEVELOPER' ? [{
          project: { assignedToId: req.user!.id }
        }] : [])
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          },
          customer: {
            select: { id: true, name: true, email: true, company: true }
          },
          lead: {
            select: { id: true, name: true, email: true, company: true }
          },
          order: {
            select: { id: true, orderNumber: true, projectName: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          },
          milestone: {
            select: { id: true, title: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting activities'
    });
  }
};

// @desc    Get single activity
// @route   GET /api/v1/activities/:id
// @access  Private
export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see activities they created or are related to their entities
    if (req.user!.role !== 'ADMIN') {
      where.OR = [
        { userId: req.user!.id },
        ...(req.user!.role === 'CLIENT' ? [{
          order: { userId: req.user!.id }
        }] : []),
        ...(req.user!.role === 'DEVELOPER' ? [{
          project: { assignedToId: req.user!.id }
        }] : [])
      ];
    }

    const activity = await prisma.activity.findFirst({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        lead: {
          select: { id: true, name: true, email: true, company: true }
        },
        order: {
          select: { id: true, orderNumber: true, projectName: true, status: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        milestone: {
          select: { id: true, title: true, status: true, dueDate: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting activity'
    });
  }
};

// @desc    Create activity
// @route   POST /api/v1/activities
// @access  Private
export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createActivitySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Verify the entity exists and user has access to it
    const { entityType, entityId } = value;
    let hasAccess = false;

    switch (entityType) {
      case 'customer':
        const customer = await prisma.customer.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role !== 'ADMIN' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!customer;
        break;

      case 'lead':
        const lead = await prisma.lead.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role !== 'ADMIN' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!lead;
        break;

      case 'order':
        const order = await prisma.order.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { userId: req.user!.id })
          }
        });
        hasAccess = !!order || req.user!.role === 'ADMIN';
        break;

      case 'project':
        const project = await prisma.project.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { order: { userId: req.user!.id } }),
            ...(req.user!.role === 'DEVELOPER' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!project || req.user!.role === 'ADMIN';
        break;

      case 'milestone':
        const milestone = await prisma.milestone.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { project: { order: { userId: req.user!.id } } }),
            ...(req.user!.role === 'DEVELOPER' && { project: { assignedToId: req.user!.id } })
          }
        });
        hasAccess = !!milestone || req.user!.role === 'ADMIN';
        break;
    }

    if (!hasAccess) {
      return res.status(404).json({
        success: false,
        error: `${entityType} not found or access denied`
      });
    }

    const activity = await prisma.activity.create({
      data: {
        ...value,
        userId: req.user!.id
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        lead: {
          select: { id: true, name: true, email: true, company: true }
        },
        order: {
          select: { id: true, orderNumber: true, projectName: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        milestone: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating activity'
    });
  }
};

// @desc    Update activity
// @route   PUT /api/v1/activities/:id
// @access  Private
export const updateActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateActivitySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only update activities they created
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

    const activity = await prisma.activity.update({
      where,
      data: value,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        lead: {
          select: { id: true, name: true, email: true, company: true }
        },
        order: {
          select: { id: true, orderNumber: true, projectName: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        milestone: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    res.json({
      success: true,
      data: activity
    });
  } catch (error: unknown) {
    console.error('Update activity error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/v1/activities/:id
// @access  Private (Admin only)
export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.activity.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Delete activity error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Get activities for specific entity
// @route   GET /api/v1/activities/:entityType/:entityId
// @access  Private
export const getEntityActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Validate entity type
    if (!['customer', 'lead', 'order', 'project', 'milestone'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity type'
      });
    }

    // Verify the entity exists and user has access to it
    let hasAccess = false;

    switch (entityType) {
      case 'customer':
        const customer = await prisma.customer.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role !== 'ADMIN' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!customer;
        break;

      case 'lead':
        const lead = await prisma.lead.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role !== 'ADMIN' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!lead;
        break;

      case 'order':
        const order = await prisma.order.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { userId: req.user!.id })
          }
        });
        hasAccess = !!order || req.user!.role === 'ADMIN';
        break;

      case 'project':
        const project = await prisma.project.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { order: { userId: req.user!.id } }),
            ...(req.user!.role === 'DEVELOPER' && { assignedToId: req.user!.id })
          }
        });
        hasAccess = !!project || req.user!.role === 'ADMIN';
        break;

      case 'milestone':
        const milestone = await prisma.milestone.findFirst({
          where: {
            id: entityId,
            ...(req.user!.role === 'CLIENT' && { project: { order: { userId: req.user!.id } } }),
            ...(req.user!.role === 'DEVELOPER' && { project: { assignedToId: req.user!.id } })
          }
        });
        hasAccess = !!milestone || req.user!.role === 'ADMIN';
        break;
    }

    if (!hasAccess) {
      return res.status(404).json({
        success: false,
        error: `${entityType} not found or access denied`
      });
    }

    const where: any = {
      entityType,
      entityId
    };

    if (type) {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get entity activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting entity activities'
    });
  }
};
