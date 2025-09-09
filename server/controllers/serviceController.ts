import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createServiceSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(1000).required(),
  category: Joi.string().valid('WEB_DEVELOPMENT', 'MOBILE_APP', 'CONSULTING').required(),
  pricing: Joi.string().valid('FIXED_PRICE', 'HOURLY', 'SUBSCRIPTION').required(),
  basePrice: Joi.number().min(0).when('pricing', {
    is: 'FIXED_PRICE',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  hourlyRate: Joi.number().min(0).when('pricing', {
    is: 'HOURLY',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  currency: Joi.string().default('USD'),
  tags: Joi.array().items(Joi.string()).default([]),
  portfolio: Joi.array().items(Joi.string()).default([]),
  duration: Joi.number().min(1).optional()
});

const updateServiceSchema = Joi.object({
  title: Joi.string().min(5).max(100).optional(),
  description: Joi.string().min(20).max(1000).optional(),
  category: Joi.string().valid('WEB_DEVELOPMENT', 'MOBILE_APP', 'CONSULTING').optional(),
  pricing: Joi.string().valid('FIXED_PRICE', 'HOURLY', 'SUBSCRIPTION').optional(),
  basePrice: Joi.number().min(0).optional(),
  hourlyRate: Joi.number().min(0).optional(),
  currency: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  portfolio: Joi.array().items(Joi.string()).optional(),
  duration: Joi.number().min(1).optional(),
  isActive: Joi.boolean().optional()
});

// @desc    Get all services with filtering and pagination
// @route   GET /api/v1/services
// @access  Public
export const getServices = async (req: Request, res: Response) => {
  try {
    const {
      category,
      minRating,
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { hasSome: [search as string] } }
      ];
    }

    // Get services with agent info
    const services = await prisma.service.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            reputation: {
              select: {
                score: true,
                reviews: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder
      },
      skip,
      take: limitNum
    });

    // Get total count
    const total = await prisma.service.count({ where });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching services'
    });
  }
};

// @desc    Get service by ID
// @route   GET /api/v1/services/:id
// @access  Public
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
            reputation: {
              select: {
                score: true,
                reviews: true,
                completed: true
              }
            }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching service'
    });
  }
};

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private (Agents only)
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createServiceSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if user is an agent
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'AGENT') {
      return res.status(403).json({
        success: false,
        error: 'Only agents can create services'
      });
    }

    const serviceData = {
      ...value,
      agentId: req.user!.id
    };

    const service = await prisma.service.create({
      data: serviceData,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating service'
    });
  }
};

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private (Service owner only)
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateServiceSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if service exists and user owns it
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    if (service.agentId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own services'
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: value,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating service'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private (Service owner only)
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if service exists and user owns it
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    if (service.agentId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own services'
      });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting service'
    });
  }
};

// @desc    Get services by agent
// @route   GET /api/v1/services/agent/:agentId
// @access  Public
export const getAgentServices = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const services = await prisma.service.findMany({
      where: {
        agentId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    const total = await prisma.service.count({
      where: {
        agentId,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get agent services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching agent services'
    });
  }
};
