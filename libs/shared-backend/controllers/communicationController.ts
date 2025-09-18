import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../middleware/logging';
import { sendEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Validation schemas
const createMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['MESSAGE', 'EMAIL', 'NOTIFICATION']).default('MESSAGE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  scheduledFor: z.string().datetime().optional(),
});

const createCommunicationLogSchema = z.object({
  type: z.enum(['EMAIL', 'PHONE', 'SMS', 'MEETING', 'NOTE', 'TASK', 'VIDEO_CALL']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  duration: z.number().optional(),
  outcome: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

// Internal messaging system
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = '1', limit = '20', type, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      OR: [
        { senderId: userId },
        { recipientId: userId },
      ],
    };

    if (type) where.type = type;
    if (status) where.status = status;

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, profilePhoto: true },
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, profilePhoto: true },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        messages,
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
    logger.error('Get messages error', { error, userId: req.user?.userId });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = createMessageSchema.parse(req.body);
    const senderId = req.user?.userId;

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: validatedData.recipientId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        ...validatedData,
        senderId: senderId!,
        status: validatedData.scheduledFor ? 'SCHEDULED' : 'SENT',
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, profilePhoto: true },
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, profilePhoto: true },
        },
      },
    });

    // Send email notification for email type messages
    if (validatedData.type === 'EMAIL') {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true, lastName: true, email: true },
      });

      await sendEmail({
        to: recipient.email,
        subject: validatedData.subject,
        template: 'internal-message',
        data: {
          senderName: `${sender!.firstName} ${sender!.lastName}`,
          senderEmail: sender!.email,
          subject: validatedData.subject,
          content: validatedData.content,
          messageId: message.id,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'MESSAGE_SENT',
        description: `Message sent to ${recipient.firstName} ${recipient.lastName}`,
        userId: senderId!,
        entityType: 'MESSAGE',
        entityId: message.id,
        metadata: {
          recipientId: recipient.id,
          messageType: validatedData.type,
          subject: validatedData.subject,
        },
      },
    });

    logger.info('Message sent', {
      messageId: message.id,
      senderId,
      recipientId: validatedData.recipientId,
      type: validatedData.type,
    });

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    logger.error('Send message error', { error, body: req.body });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Mark message as read
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Only recipient can mark as read
    if (message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { 
        status: 'READ',
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: updatedMessage,
      message: 'Message marked as read',
    });
  } catch (error) {
    logger.error('Mark message as read error', { error, messageId: req.params.id });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Communication logs for CRM
export const getCommunicationLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      customerId,
      leadId,
      contactId,
      type,
      direction,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (leadId) where.leadId = leadId;
    if (contactId) where.contactId = contactId;
    if (type) where.type = type;
    if (direction) where.direction = direction;

    // Role-based filtering
    if (req.user?.role === 'AGENT') {
      where.userId = req.user.userId;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          lead: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.communicationLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        logs,
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
    logger.error('Get communication logs error', { error, query: req.query });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const createCommunicationLog = async (req: Request, res: Response) => {
  try {
    const validatedData = createCommunicationLogSchema.parse(req.body);
    const userId = req.user?.userId;

    // Validate that at least one entity is specified
    if (!validatedData.customerId && !validatedData.leadId && !validatedData.contactId) {
      return res.status(400).json({
        success: false,
        error: 'At least one entity (customer, lead, or contact) must be specified',
      });
    }

    const log = await prisma.communicationLog.create({
      data: {
        ...validatedData,
        userId: userId!,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Create follow-up task if required
    if (validatedData.followUpRequired && validatedData.followUpDate) {
      await prisma.task.create({
        data: {
          title: `Follow up: ${validatedData.subject || validatedData.type}`,
          description: `Follow up on ${validatedData.type.toLowerCase()} communication`,
          type: 'FOLLOW_UP',
          priority: 'MEDIUM',
          status: 'TODO',
          assignedTo: userId!,
          dueDate: new Date(validatedData.followUpDate),
          customerId: validatedData.customerId,
          leadId: validatedData.leadId,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COMMUNICATION_LOGGED',
        description: `${validatedData.type} communication logged`,
        userId: userId!,
        entityType: 'COMMUNICATION_LOG',
        entityId: log.id,
        metadata: {
          communicationType: validatedData.type,
          direction: validatedData.direction,
          customerId: validatedData.customerId,
          leadId: validatedData.leadId,
        },
      },
    });

    logger.info('Communication log created', {
      logId: log.id,
      type: validatedData.type,
      direction: validatedData.direction,
      userId,
    });

    res.status(201).json({
      success: true,
      data: log,
      message: 'Communication log created successfully',
    });
  } catch (error) {
    logger.error('Create communication log error', { error, body: req.body });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get communication summary for entity
export const getCommunicationSummary = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    if (!['customer', 'lead', 'contact'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity type',
      });
    }

    const whereClause = { [`${entityType}Id`]: entityId };

    const [
      totalCommunications,
      communicationsByType,
      recentCommunications,
      lastCommunication,
    ] = await Promise.all([
      prisma.communicationLog.count({ where: whereClause }),
      prisma.communicationLog.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { type: true },
      }),
      prisma.communicationLog.findMany({
        where: whereClause,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.communicationLog.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalCommunications,
          lastCommunicationDate: lastCommunication?.createdAt,
          communicationsByType: communicationsByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          }, {} as Record<string, number>),
        },
        recentCommunications: recentCommunications.map(comm => ({
          id: comm.id,
          type: comm.type,
          direction: comm.direction,
          subject: comm.subject,
          createdAt: comm.createdAt,
          userName: `${comm.user.firstName} ${comm.user.lastName}`,
        })),
      },
    });
  } catch (error) {
    logger.error('Get communication summary error', { error, params: req.params });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get unread message count
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        status: { in: ['SENT', 'DELIVERED'] },
      },
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    logger.error('Get unread message count error', { error, userId: req.user?.userId });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
