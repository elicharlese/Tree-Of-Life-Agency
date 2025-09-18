import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, emailTemplates } from '../../lib/email';

const prisma = new PrismaClient();

// Validation schemas
const initializeProjectSchema = Joi.object({
  techStack: Joi.array().items(Joi.string()).default([]),
  estimatedHours: Joi.number().positive().allow(null),
  budget: Joi.number().positive().allow(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  assignedToId: Joi.string().allow(null)
});

const updateProgressSchema = Joi.object({
  progress: Joi.number().min(0).max(100).required(),
  description: Joi.string().required(),
  hoursWorked: Joi.number().positive().allow(null)
});

// Developer skill matching algorithm
const calculateSkillMatch = (requiredSkills: string[], developerSkills: string[]): number => {
  if (requiredSkills.length === 0) return 50; // Default score if no skills specified
  
  const matchingSkills = requiredSkills.filter(skill => 
    developerSkills.some(devSkill => 
      devSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(devSkill.toLowerCase())
    )
  );
  
  return (matchingSkills.length / requiredSkills.length) * 100;
};

// Timeline estimation algorithm
const calculateProjectTimeline = (orderData: any, techStack: string[]): { estimatedHours: number; startDate: Date; endDate: Date } => {
  // Base hours calculation based on project complexity
  let baseHours = 40; // Minimum project hours
  
  // Add hours based on tech stack complexity
  const complexTechnologies = ['React', 'Vue', 'Angular', 'Node.js', 'PostgreSQL', 'MongoDB', 'Kubernetes'];
  const techComplexity = techStack.filter(tech => complexTechnologies.includes(tech)).length;
  baseHours += techComplexity * 20;
  
  // Add hours based on project amount (rough estimation)
  if (orderData.totalAmount) {
    const amountMultiplier = Math.floor(orderData.totalAmount / 5000); // Every $5k adds 20 hours
    baseHours += amountMultiplier * 20;
  }
  
  // Calculate timeline
  const hoursPerWeek = 40;
  const weeksNeeded = Math.ceil(baseHours / hoursPerWeek);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 3); // Start in 3 days
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (weeksNeeded * 7));
  
  return {
    estimatedHours: baseHours,
    startDate,
    endDate
  };
};

// Budget breakdown generation
const generateBudgetBreakdown = (totalAmount: number, estimatedHours: number): any => {
  return {
    development: Math.round(totalAmount * 0.7), // 70% for development
    design: Math.round(totalAmount * 0.15),     // 15% for design
    testing: Math.round(totalAmount * 0.10),    // 10% for testing
    management: Math.round(totalAmount * 0.05), // 5% for project management
    hourlyRate: Math.round(totalAmount / estimatedHours)
  };
};

// @desc    Initialize project from order
// @route   POST /api/orders/:id/initialize-project
// @access  Private (Admin)
export const initializeProjectFromOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = initializeProjectSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Only admin can initialize projects
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to initialize projects'
      });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        error: 'Order must be confirmed before project initialization'
      });
    }

    // Check if project already exists for this order
    const existingProject = await prisma.project.findFirst({
      where: { orderId: id }
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: 'Project already exists for this order'
      });
    }

    // Calculate timeline and budget
    const timeline = calculateProjectTimeline(order, value.techStack || []);
    const budgetBreakdown = generateBudgetBreakdown(Number(order.totalAmount), timeline.estimatedHours);

    // Find best matching developer if not specified
    let assignedToId = value.assignedToId;
    if (!assignedToId && value.techStack && value.techStack.length > 0) {
      const developers = await prisma.user.findMany({
        where: {
          role: 'AGENT',
          isActive: true
        }
      });

      // For this example, we'll assign to the first available developer
      // In a real system, you'd implement proper skill matching
      if (developers.length > 0) {
        assignedToId = developers[0].id;
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: order.projectName,
        description: order.description,
        orderId: order.id,
        customerId: order.customerId,
        createdById: req.user!.id,
        assignedToId,
        status: 'PLANNING',
        techStack: value.techStack || [],
        estimatedHours: value.estimatedHours || timeline.estimatedHours,
        budget: value.budget || order.totalAmount,
        startDate: value.startDate || timeline.startDate,
        endDate: value.endDate || timeline.endDate
      },
      include: {
        order: true,
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Create initial milestones
    const milestones = [
      {
        title: 'Project Planning & Setup',
        description: 'Initial project setup and requirement analysis',
        projectId: project.id,
        assignedToId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        status: 'PENDING' as const,
        progress: 0
      },
      {
        title: 'Development Phase 1',
        description: 'Core functionality implementation',
        projectId: project.id,
        assignedToId,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        status: 'PENDING' as const,
        progress: 0
      },
      {
        title: 'Testing & Quality Assurance',
        description: 'Comprehensive testing and bug fixes',
        projectId: project.id,
        assignedToId,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 5 weeks
        status: 'PENDING' as const,
        progress: 0
      },
      {
        title: 'Deployment & Launch',
        description: 'Final deployment and project delivery',
        projectId: project.id,
        assignedToId,
        dueDate: timeline.endDate,
        status: 'PENDING' as const,
        progress: 0
      }
    ];

    await prisma.milestone.createMany({
      data: milestones
    });

    // Update order status
    await prisma.order.update({
      where: { id },
      data: { status: 'IN_PROGRESS' }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'created',
        title: 'Project Initialized',
        description: `Project initialized from order ${order.orderNumber}`,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    // Send email notification to client
    try {
      const template = emailTemplates.projectStatusUpdate(
        project.name,
        'Project Initialized',
        order.customerId
      );
      
      await sendEmail({
        to: order.customer.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    } catch (emailError) {
      console.error('Failed to send project initialization email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        project,
        budgetBreakdown,
        timeline: {
          estimatedHours: timeline.estimatedHours,
          startDate: timeline.startDate,
          endDate: timeline.endDate
        }
      },
      message: 'Project initialized successfully'
    });
  } catch (error) {
    console.error('Initialize project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error initializing project'
    });
  }
};

// @desc    Get project timeline
// @route   GET /api/projects/:id/timeline
// @access  Private
export const getProjectTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Access control
    if (req.user!.role === 'CLIENT') {
      where.order = { userId: req.user!.id };
    } else if (req.user!.role === 'AGENT') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        activities: {
          where: { type: 'progress_update' },
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

    // Calculate overall progress
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
    const overallProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Calculate time metrics
    const now = new Date();
    const startDate = project.startDate || project.createdAt;
    const endDate = project.endDate;
    
    let timeProgress = 0;
    if (endDate) {
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedTime = now.getTime() - startDate.getTime();
      timeProgress = Math.max(0, Math.min(100, (elapsedTime / totalDuration) * 100));
    }

    const timeline = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        estimatedHours: project.estimatedHours,
        actualHours: project.actualHours
      },
      progress: {
        overall: Math.round(overallProgress),
        time: Math.round(timeProgress),
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          inProgress: project.milestones.filter(m => m.status === 'IN_PROGRESS').length,
          overdue: project.milestones.filter(m => 
            m.status !== 'COMPLETED' && new Date(m.dueDate) < now
          ).length
        }
      },
      milestones: project.milestones,
      recentActivities: project.activities
    };

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get project timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting project timeline'
    });
  }
};

// @desc    Update project progress
// @route   POST /api/projects/:id/progress-update
// @access  Private
export const updateProjectProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProgressSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { progress, description, hoursWorked } = value;

    const where: any = { id };

    // Access control
    if (req.user!.role === 'CLIENT') {
      where.order = { userId: req.user!.id };
    } else if (req.user!.role === 'AGENT') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        customer: true,
        order: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Update actual hours if provided
    let updateData: any = {};
    if (hoursWorked) {
      updateData.actualHours = (project.actualHours || 0) + hoursWorked;
    }

    // Update project if needed
    if (Object.keys(updateData).length > 0) {
      await prisma.project.update({
        where: { id },
        data: updateData
      });
    }

    // Log progress activity
    await prisma.activity.create({
      data: {
        entityType: 'project',
        entityId: project.id,
        type: 'progress_update',
        title: `Progress Update: ${progress}%`,
        description,
        userId: req.user!.id,
        projectId: project.id,
        customerId: project.customerId,
        orderId: project.orderId
      }
    });

    // Send email notification to client if significant progress
    if (progress >= 25 && progress % 25 === 0) {
      try {
        const template = emailTemplates.projectStatusUpdate(
          project.name,
          `${progress}% Complete`,
          project.customer.name
        );
        
        await sendEmail({
          to: project.customer.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
      } catch (emailError) {
        console.error('Failed to send progress update email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress,
        hoursWorked,
        totalHours: updateData.actualHours || project.actualHours
      }
    });
  } catch (error) {
    console.error('Update project progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating project progress'
    });
  }
};

// @desc    Get project budget status
// @route   GET /api/projects/:id/budget-status
// @access  Private
export const getProjectBudgetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Access control
    if (req.user!.role === 'CLIENT') {
      where.order = { userId: req.user!.id };
    } else if (req.user!.role === 'AGENT') {
      where.assignedToId = req.user!.id;
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        order: true,
        activities: {
          where: { type: 'progress_update' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const budget = project.budget || project.order.totalAmount;
    const estimatedHours = project.estimatedHours || 0;
    const actualHours = project.actualHours || 0;
    const hourlyRate = estimatedHours > 0 ? Number(budget) / estimatedHours : 0;

    // Calculate costs
    const estimatedCost = Number(budget);
    const actualCost = actualHours * hourlyRate;
    const remainingBudget = Number(budget) - actualCost;
    const budgetUtilization = Number(budget) > 0 ? (actualCost / Number(budget)) * 100 : 0;

    // Budget health status
    let healthStatus = 'good';
    if (budgetUtilization > 90) {
      healthStatus = 'critical';
    } else if (budgetUtilization > 75) {
      healthStatus = 'warning';
    } else if (budgetUtilization > 50) {
      healthStatus = 'caution';
    }

    const budgetStatus = {
      budget: {
        total: budget,
        estimated: estimatedCost,
        actual: Math.round(actualCost),
        remaining: Math.round(remainingBudget),
        utilization: Math.round(budgetUtilization),
        healthStatus
      },
      hours: {
        estimated: estimatedHours,
        actual: actualHours,
        remaining: Math.max(0, estimatedHours - actualHours),
        hourlyRate: Math.round(hourlyRate)
      },
      breakdown: generateBudgetBreakdown(Number(budget), estimatedHours),
      projections: {
        estimatedCompletion: actualHours > 0 ? 
          Math.round((estimatedHours / actualHours) * actualCost) : estimatedCost,
        timeToCompletion: estimatedHours - actualHours > 0 ? 
          Math.ceil((estimatedHours - actualHours) / 40) : 0 // Weeks remaining
      }
    };

    res.json({
      success: true,
      data: budgetStatus
    });
  } catch (error) {
    console.error('Get project budget status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting project budget status'
    });
  }
};
