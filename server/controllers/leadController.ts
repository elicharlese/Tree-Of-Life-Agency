import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const createLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(''),
  company: Joi.string().allow(''),
  jobTitle: Joi.string().allow(''),
  source: Joi.string().required(),
  status: Joi.string().valid('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST').default('NEW'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  score: Joi.number().min(0).max(100).default(0),
  assignedToId: Joi.string().allow(''),
  estimatedValue: Joi.number().positive().allow(null),
  expectedCloseDate: Joi.date().allow(null),
  notes: Joi.string().allow(''),
  tags: Joi.array().items(Joi.string())
});

const updateLeadSchema = createLeadSchema.fork(['name', 'email', 'source'], (schema) => schema.optional());

const updateScoreSchema = Joi.object({
  score: Joi.number().min(0).max(100).required(),
  reason: Joi.string().allow('')
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST').required(),
  reason: Joi.string().allow('')
});

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Private
export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, priority, assignedTo, minScore, maxScore } = req.query;
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

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = Number(minScore);
      if (maxScore) where.score.lte = Number(maxScore);
    }

    // Non-admin users can only see leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          customer: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              activities: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { score: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: unknown) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting leads'
    });
  }
};

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
export const getLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only see leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const lead = await prisma.lead.findFirst({
      where,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
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

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error: unknown) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting lead'
    });
  }
};

// @desc    Create lead
// @route   POST /api/v1/leads
// @access  Private
export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createLeadSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // If assignedToId is not provided, assign to current user
    if (!value.assignedToId) {
      value.assignedToId = req.user!.id;
    }

    // Calculate initial score based on available data
    let initialScore = value.score || 0;
    if (value.company) initialScore += 10;
    if (value.phone) initialScore += 5;
    if (value.estimatedValue) initialScore += 15;
    if (value.expectedCloseDate) initialScore += 10;
    value.score = Math.min(initialScore, 100);

    const lead = await prisma.lead.create({
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
        entityType: 'lead',
        entityId: lead.id,
        type: 'created',
        title: 'Lead Created',
        description: `Lead ${lead.name} was created with score ${lead.score}`,
        userId: req.user!.id,
        leadId: lead.id
      }
    });

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error: unknown) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating lead'
    });
  }
};

// @desc    Update lead
// @route   PUT /api/v1/leads/:id
// @access  Private
export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLeadSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const where: any = { id };

    // Non-admin users can only update leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const lead = await prisma.lead.update({
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
        entityType: 'lead',
        entityId: lead.id,
        type: 'updated',
        title: 'Lead Updated',
        description: `Lead ${lead.name} was updated`,
        userId: req.user!.id,
        leadId: lead.id
      }
    });

    res.json({
      success: true,
      data: lead
    });
  } catch (error: unknown) {
    console.error('Update lead error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/v1/leads/:id
// @access  Private (Admin only)
export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.lead.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Delete lead error:', error as any);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error deleting lead'
    });
  }
};

// @desc    Update lead score
// @route   PUT /api/v1/leads/:id/score
// @access  Private
export const updateLeadScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateScoreSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { score, reason } = value;

    const where: any = { id };

    // Non-admin users can only update leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const lead = await prisma.lead.update({
      where,
      data: { score },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'lead',
        entityId: lead.id,
        type: 'score_updated',
        title: 'Lead Score Updated',
        description: `Lead score updated to ${score}${reason ? ': ' + reason : ''}`,
        userId: req.user!.id,
        leadId: lead.id
      }
    });

    res.json({
      success: true,
      data: lead
    });
  } catch (error: unknown) {
    console.error('Update lead score error:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error updating lead score'
    });
  }
};

// @desc    Update lead status
// @route   PUT /api/v1/leads/:id/status
// @access  Private
export const updateLeadStatus = async (req: AuthRequest, res: Response) => {
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

    // Non-admin users can only update leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const lead = await prisma.lead.update({
      where,
      data: { status },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'lead',
        entityId: lead.id,
        type: 'status_changed',
        title: 'Lead Status Changed',
        description: `Lead status changed to ${status}${reason ? ': ' + reason : ''}`,
        userId: req.user!.id,
        leadId: lead.id
      }
    });

    res.json({
      success: true,
      data: lead
    });
  } catch (error: unknown) {
    console.error('Update lead status error:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error updating lead status'
    });
  }
};

// @desc    Convert lead to customer
// @route   POST /api/v1/leads/:id/convert
// @access  Private
export const convertLeadToCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Non-admin users can only convert leads assigned to them
    if (req.user!.role !== 'ADMIN') {
      where.assignedToId = req.user!.id;
    }

    const lead = await prisma.lead.findFirst({ where });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    if (lead.status === 'WON' || lead.customerId) {
      return res.status(400).json({
        success: false,
        error: 'Lead is already converted'
      });
    }

    // Check if customer with this email already exists
    let customer = await prisma.customer.findUnique({
      where: { email: lead.email }
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: 'ACTIVE',
          source: lead.source,
          assignedToId: lead.assignedToId,
          notes: lead.notes,
          tags: lead.tags
        }
      });
    }

    // Update lead to link to customer and mark as won
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        customerId: customer.id,
        status: 'WON'
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, company: true }
        }
      }
    });

    // Log activity for both lead and customer
    await Promise.all([
      prisma.activity.create({
        data: {
          entityType: 'lead',
          entityId: lead.id,
          type: 'converted',
          title: 'Lead Converted',
          description: `Lead ${lead.name} was converted to customer`,
          userId: req.user!.id,
          leadId: lead.id,
          customerId: customer.id
        }
      }),
      prisma.activity.create({
        data: {
          entityType: 'customer',
          entityId: customer.id,
          type: 'converted_from_lead',
          title: 'Customer Created from Lead',
          description: `Customer created from lead conversion`,
          userId: req.user!.id,
          customerId: customer.id,
          leadId: lead.id
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        lead: updatedLead,
        customer
      }
    });
  } catch (error: unknown) {
    console.error('Convert lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error converting lead to customer'
    });
  }
};
