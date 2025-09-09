import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  orderId: Joi.string().required(),
  customerId: Joi.string().required(),
  assignedToId: Joi.string().allow(''),
  status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED').default('PLANNING'),
  techStack: Joi.array().items(Joi.string()),
  estimatedHours: Joi.number().positive().allow(null),
  budget: Joi.number().positive().allow(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null)
});

const updateProjectSchema = createProjectSchema.fork(['name', 'orderId', 'customerId'], (schema) => schema.optional());

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED').required(),
  reason: Joi.string().allow('')
});

const addMilestoneSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  dueDate: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE').default('PENDING'),
  progress: Joi.number().min(0).max(100).default(0)
});

const assignDevelopersSchema = Joi.object({
  developerIds: Joi.array().items(Joi.string()).min(1).required()
});

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, customerId, assignedTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    // Non-admin users can only see projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          order: {
            select: { id: true, orderNumber: true, projectName: true, totalAmount: true }
          },
          customer: {
            select: { id: true, name: true, email: true, company: true }
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: {
              milestones: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting projects'
    });
  }
};

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Private
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true, projectName: true, totalAmount: true, status: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
        },
        milestones: {
          orderBy: { dueDate: 'asc' }
        },
        activities: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting project'
    });
  }
};

// @desc    Create project
// @route   POST /api/v1/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Verify order exists and user has access
    const orderWhere: any = { id: value.orderId };
    
    if (req.user!.role === 'CLIENT') {
      orderWhere.userId = req.user!.id;
    }

    const order = await prisma.order.findFirst({ where: orderWhere });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const project = await prisma.project.create({
      data: value,
      include: {
        order: {
          select: { id: true, orderNumber: true, projectName: true, totalAmount: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'created',
        title: 'Project Created',
        description: `Project ${project.name} was created`,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProjectSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only update projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.update({
      where,
      data: value,
      include: {
        order: {
          select: { id: true, orderNumber: true, projectName: true, totalAmount: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'updated',
        title: 'Project Updated',
        description: `Project ${project.name} was updated`,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error: unknown) {
    console.error('Update project error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Update project status
// @route   PUT /api/v1/projects/:id/status
// @access  Private
export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateStatusSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { status, reason } = value;

    const where: any = { id };

    // Non-admin users can only update projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.update({
      where,
      data: { status },
      include: {
        order: {
          select: { id: true, orderNumber: true, projectName: true }
        },
        customer: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'status_changed',
        title: 'Project Status Changed',
        description: `Project status changed to ${status}${reason ? ': ' + reason : ''}`,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error: unknown) {
    console.error('Update project status error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Get project milestones
// @route   GET /api/v1/projects/:id/milestones
// @access  Private
export const getProjectMilestones = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({ where });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId: id },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      success: true,
      data: milestones
    });
  } catch (error: unknown) {
    console.error('Get project milestones error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Add project milestone
// @route   POST /api/v1/projects/:id/milestones
// @access  Private
export const addProjectMilestone = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = addMilestoneSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only add milestones to projects assigned to them or their orders
    if (req.user!.role === 'CLIENT') {
      where.order = {
        userId: req.user!.id
      };
    } else if (req.user!.role === 'DEVELOPER') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({ where });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...value,
        projectId: id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'milestone',
        entityId: milestone.id,
        type: 'created',
        title: 'Milestone Created',
        description: `Milestone ${milestone.title} was added to project`,
        userId: req.user!.id,
        projectId: project.id,
        milestoneId: milestone.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    res.status(201).json({
      success: true,
      data: milestone
    });
  } catch (error: unknown) {
    console.error('Add project milestone error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Assign developers to project
// @route   PUT /api/v1/projects/:id/assign
// @access  Private (Admin/Developer)
export const assignDevelopers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = assignDevelopersSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { developerIds } = value;

    // Only admin can assign developers
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to assign developers'
      });
    }

    // Verify all developers exist and have DEVELOPER role
    const developers = await prisma.user.findMany({
      where: {
        id: { in: developerIds },
        role: 'DEVELOPER',
        isActive: true
      }
    });

    if (developers.length !== developerIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more developer IDs are invalid'
      });
    }

    // For now, assign the first developer as the main assignee
    // In a more complex system, you might have multiple assignees
    const project = await prisma.project.update({
      where: { id },
      data: { assignedToId: developerIds[0] },
      include: {
        order: {
          select: { id: true, orderNumber: true, projectName: true }
        },
        customer: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'developers_assigned',
        title: 'Developers Assigned',
        description: `${developers.length} developer(s) assigned to project`,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    res.json({
      success: true,
      data: project,
      message: `${developers.length} developer(s) assigned successfully`
    });
  } catch (error: unknown) {
    console.error('Assign developers error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
