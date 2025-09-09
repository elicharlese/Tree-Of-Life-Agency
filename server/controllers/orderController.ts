import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().min(2).max(100).required(),
  customerEmail: Joi.string().email().required(),
  companyName: Joi.string().allow(''),
  projectName: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  totalAmount: Joi.number().positive().required(),
  estimatedTimeline: Joi.string().allow(''),
  status: Joi.string().valid('DRAFT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').default('DRAFT'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM')
});

const updateOrderSchema = createOrderSchema.fork(['customerId', 'customerName', 'customerEmail', 'projectName', 'totalAmount'], (schema) => schema.optional());

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('DRAFT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required(),
  reason: Joi.string().allow('')
});

// Helper function to generate order number
const generateOrderNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(year, today.getMonth(), 1),
        lt: new Date(year, today.getMonth() + 1, 1)
      }
    }
  });

  return `ORD-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, customerId, priority } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { projectName: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (priority) {
      where.priority = priority;
    }

    // Non-admin users can only see their own orders
    if (req.user!.role === 'CLIENT') {
      where.userId = req.user!.id;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: {
            select: { id: true, name: true, email: true, company: true }
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          items: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: unknown) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see their own orders
    if (req.user!.role === 'CLIENT') {
      where.userId = req.user!.id;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        items: true,
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

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: unknown) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting order'
    });
  }
};

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        ...value,
        orderNumber,
        userId: req.user!.id
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        items: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'order',
        entityId: order.id,
        type: 'created',
        title: 'Order Created',
        description: `Order ${order.orderNumber} created for ${order.projectName}`,
        userId: req.user!.id,
        orderId: order.id,
        customerId: order.customerId
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating order'
    });
  }
};

// @desc    Update order
// @route   PUT /api/v1/orders/:id
// @access  Private
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only update their own orders
    if (req.user!.role === 'CLIENT') {
      where.userId = req.user!.id;
    }

    const order = await prisma.order.update({
      where,
      data: value,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        items: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'order',
        entityId: order.id,
        type: 'updated',
        title: 'Order Updated',
        description: `Order ${order.orderNumber} was updated`,
        userId: req.user!.id,
        orderId: order.id,
        customerId: order.customerId
      }
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error: unknown) {
    console.error('Update order error:', error);
    const err = error as any;
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error updating order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
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

    // Non-admin users can only update their own orders
    if (req.user!.role === 'CLIENT') {
      where.userId = req.user!.id;
    }

    const order = await prisma.order.update({
      where,
      data: { status },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        items: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'order',
        entityId: order.id,
        type: 'status_changed',
        title: 'Order Status Changed',
        description: `Order status changed to ${status}${reason ? ': ' + reason : ''}`,
        userId: req.user!.id,
        orderId: order.id,
        customerId: order.customerId
      }
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error: unknown) {
    console.error('Update order status error:', error);
    const err = error as any;
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error updating order status'
    });
  }
};

// @desc    Get order timeline
// @route   GET /api/v1/orders/:id/timeline
// @access  Private
export const getOrderTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { orderId: id };

    // Non-admin users can only see their own orders
    if (req.user!.role === 'CLIENT') {
      const order = await prisma.order.findFirst({
        where: { id, userId: req.user!.id }
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error: unknown) {
    console.error('Get order timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting order timeline'
    });
  }
};
