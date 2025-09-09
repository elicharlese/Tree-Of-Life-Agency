import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(''),
  company: Joi.string().allow(''),
  website: Joi.string().uri().allow(''),
  industry: Joi.string().allow(''),
  companySize: Joi.string().valid('startup', 'small', 'medium', 'enterprise').allow(''),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED').default('PROSPECT'),
  source: Joi.string().allow(''),
  assignedToId: Joi.string().allow(''),
  notes: Joi.string().allow(''),
  tags: Joi.array().items(Joi.string()),
  address: Joi.string().allow(''),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  zipCode: Joi.string().allow(''),
  country: Joi.string().allow(''),
  linkedinUrl: Joi.string().uri().allow(''),
  twitterUrl: Joi.string().uri().allow(''),
  githubUrl: Joi.string().uri().allow('')
});

const updateCustomerSchema = createCustomerSchema.fork(['name', 'email'], (schema) => schema.optional());

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, source, assignedTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    // Non-admin users can only see customers assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: {
              leads: true,
              orders: true,
              projects: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting customers'
    });
  }
};

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
export const getCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see customers assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const customer = await prisma.customer.findFirst({
      where,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: {
            leads: true,
            orders: true,
            projects: true,
            activities: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting customer'
    });
  }
};

// @desc    Create customer
// @route   POST /api/v1/customers
// @access  Private
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if customer with email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: value.email }
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }

    // If assignedToId is not provided, assign to current user
    if (!value.assignedToId) {
      value.assignedToId = req.user!.id;
    }

    const customer = await prisma.customer.create({
      data: value,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'customer',
        entityId: customer.id,
        type: 'created',
        title: 'Customer Created',
        description: `Customer ${customer.name} was created`,
        userId: req.user!.id,
        customerId: customer.id
      }
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating customer'
    });
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCustomerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only update customers assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const customer = await prisma.customer.update({
      where,
      data: value,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'customer',
        entityId: customer.id,
        type: 'updated',
        title: 'Customer Updated',
        description: `Customer ${customer.name} was updated`,
        userId: req.user!.id,
        customerId: customer.id
      }
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (error: unknown) {
    console.error('Update customer error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Private (Admin only)
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Delete customer error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Get customer projects
// @route   GET /api/v1/customers/:id/projects
// @access  Private
export const getCustomerProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { customerId: id };

    // Non-admin users can only see customers assigned to them
    if (req.user!.role !== 'ADMIN') {
      const customer = await prisma.customer.findFirst({
        where: { id, assignedToId: req.user!.id }
      });
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
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
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get customer projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting customer projects'
    });
  }
};

// @desc    Get customer activities
// @route   GET /api/v1/customers/:id/activities
// @access  Private
export const getCustomerActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Non-admin users can only see customers assigned to them
    if (req.user!.role !== 'ADMIN') {
      const customer = await prisma.customer.findFirst({
        where: { id, assignedToId: req.user!.id }
      });
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { customerId: id },
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activity.count({ where: { customerId: id } })
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
    console.error('Get customer activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting customer activities'
    });
  }
};
