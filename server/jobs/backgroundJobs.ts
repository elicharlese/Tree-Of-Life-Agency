import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';
import { sendEmail, sendBulkEmails } from '../services/emailService';
import { cleanupExpiredSessions } from '../middleware/sessionManager';
import { publishDashboardUpdate, publishNotification } from '../graphql/pubsub';

const prisma = new PrismaClient();

// Job queue interface for better organization
interface BackgroundJob {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

// Background job implementations
const cleanupExpiredInvitations = async () => {
  try {
    const expiredInvitations = await prisma.invitation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    });

    if (expiredInvitations.count > 0) {
      logger.info('Expired invitations cleaned up', { 
        count: expiredInvitations.count 
      });
    }
  } catch (error) {
    logger.error('Cleanup expired invitations error', { error });
  }
};

const cleanupOldActivities = async () => {
  try {
    // Keep activities for 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const deletedActivities = await prisma.activity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    if (deletedActivities.count > 0) {
      logger.info('Old activities cleaned up', { 
        count: deletedActivities.count,
        cutoffDate: cutoffDate.toISOString(),
      });
    }
  } catch (error) {
    logger.error('Cleanup old activities error', { error });
  }
};

const sendFollowUpReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find leads with follow-up dates for today
    const leadsToFollowUp = await prisma.lead.findMany({
      where: {
        nextFollowUpDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'],
        },
      },
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Group by assigned user
    const remindersByUser = new Map();
    leadsToFollowUp.forEach(lead => {
      if (lead.assignedUser) {
        const userId = lead.assignedUser.id;
        if (!remindersByUser.has(userId)) {
          remindersByUser.set(userId, {
            user: lead.assignedUser,
            leads: [],
          });
        }
        remindersByUser.get(userId).leads.push(lead);
      }
    });

    // Send reminder emails
    const emailPromises = Array.from(remindersByUser.values()).map(({ user, leads }) => ({
      to: user.email,
      subject: `Follow-up Reminders - ${leads.length} lead(s) require attention`,
      template: 'follow-up-reminder',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        leads: leads.map((lead: any) => ({
          name: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          email: lead.email,
          status: lead.status,
          estimatedValue: lead.estimatedValue,
        })),
        dashboardUrl: `${process.env.FRONTEND_URL}/crm/leads`,
      },
    }));

    if (emailPromises.length > 0) {
      await sendBulkEmails(emailPromises);
      logger.info('Follow-up reminders sent', { 
        userCount: emailPromises.length,
        totalLeads: leadsToFollowUp.length,
      });
    }
  } catch (error) {
    logger.error('Send follow-up reminders error', { error });
  }
};

const generateDailyReports = async () => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // Get daily metrics
    const [
      newCustomers,
      newLeads,
      completedProjects,
      newActivities,
    ] = await Promise.all([
      prisma.customer.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: todayStart,
          },
        },
      }),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: todayStart,
          },
        },
      }),
      prisma.project.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: yesterday,
            lt: todayStart,
          },
        },
      }),
      prisma.activity.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: todayStart,
          },
        },
      }),
    ]);

    // Get admin users for report distribution
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Send daily report emails
    const reportPromises = adminUsers.map(user => ({
      to: user.email,
      subject: `Daily Report - ${yesterday.toDateString()}`,
      template: 'daily-report',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        date: yesterday.toDateString(),
        metrics: {
          newCustomers,
          newLeads,
          completedProjects,
          newActivities,
        },
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      },
    }));

    if (reportPromises.length > 0) {
      await sendBulkEmails(reportPromises);
      logger.info('Daily reports sent', { 
        recipientCount: adminUsers.length,
        date: yesterday.toDateString(),
      });
    }
  } catch (error) {
    logger.error('Generate daily reports error', { error });
  }
};

const updateLeadScores = async () => {
  try {
    // Get all active leads
    const leads = await prisma.lead.findMany({
      where: {
        status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] },
      },
      include: {
        _count: {
          select: { communications: true },
        },
      },
    });

    const updatePromises = leads.map(async (lead) => {
      let score = 0;
      
      // Base score from status
      const statusScores = {
        'NEW': 10,
        'CONTACTED': 25,
        'QUALIFIED': 50,
        'PROPOSAL': 75,
        'NEGOTIATION': 90,
      };
      score += statusScores[lead.status as keyof typeof statusScores] || 0;
      
      // Company bonus
      if (lead.company) score += 10;
      
      // Estimated value bonus
      if (lead.estimatedValue) {
        if (lead.estimatedValue > 100000) score += 20;
        else if (lead.estimatedValue > 50000) score += 15;
        else if (lead.estimatedValue > 10000) score += 10;
        else score += 5;
      }
      
      // Communication activity bonus
      const communicationCount = lead._count?.communications || 0;
      score += Math.min(communicationCount * 2, 20);
      
      // Recency bonus (leads created in last 7 days get bonus)
      const daysSinceCreated = (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated <= 7) score += 5;
      
      // Cap at 100
      score = Math.min(score, 100);
      
      // Only update if score changed significantly
      if (Math.abs(lead.score - score) > 2) {
        return prisma.lead.update({
          where: { id: lead.id },
          data: { score },
        });
      }
    });

    const results = await Promise.all(updatePromises.filter(Boolean));
    
    if (results.length > 0) {
      logger.info('Lead scores updated', { count: results.length });
    }
  } catch (error) {
    logger.error('Update lead scores error', { error });
  }
};

const cleanupOldMessages = async () => {
  try {
    // Delete read messages older than 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const deletedMessages = await prisma.message.deleteMany({
      where: {
        status: 'READ',
        readAt: {
          lt: cutoffDate,
        },
      },
    });

    if (deletedMessages.count > 0) {
      logger.info('Old messages cleaned up', { 
        count: deletedMessages.count 
      });
    }
  } catch (error) {
    logger.error('Cleanup old messages error', { error });
  }
};

const refreshDashboardData = async () => {
  try {
    // Calculate fresh dashboard metrics
    const [
      totalCustomers,
      totalLeads,
      totalProjects,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.lead.count(),
      prisma.project.count(),
    ]);

    const dashboardData = {
      totalCustomers,
      totalLeads,
      totalProjects,
      lastRefreshed: new Date(),
    };

    // Publish to all connected clients
    publishDashboardUpdate(dashboardData);
    
    logger.info('Dashboard data refreshed');
  } catch (error) {
    logger.error('Refresh dashboard data error', { error });
  }
};

// Define all background jobs
const backgroundJobs: BackgroundJob[] = [
  {
    name: 'Cleanup Expired Sessions',
    schedule: '*/5 * * * *', // Every 5 minutes
    enabled: true,
    handler: async () => {
      cleanupExpiredSessions();
    },
  },
  {
    name: 'Cleanup Expired Invitations',
    schedule: '0 */2 * * *', // Every 2 hours
    enabled: true,
    handler: cleanupExpiredInvitations,
  },
  {
    name: 'Cleanup Old Activities',
    schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
    enabled: true,
    handler: cleanupOldActivities,
  },
  {
    name: 'Send Follow-up Reminders',
    schedule: '0 9 * * 1-5', // Weekdays at 9 AM
    enabled: true,
    handler: sendFollowUpReminders,
  },
  {
    name: 'Generate Daily Reports',
    schedule: '0 8 * * 1-5', // Weekdays at 8 AM
    enabled: true,
    handler: generateDailyReports,
  },
  {
    name: 'Update Lead Scores',
    schedule: '0 1 * * *', // Daily at 1 AM
    enabled: true,
    handler: updateLeadScores,
  },
  {
    name: 'Cleanup Old Messages',
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    enabled: true,
    handler: cleanupOldMessages,
  },
  {
    name: 'Refresh Dashboard Data',
    schedule: '*/15 * * * *', // Every 15 minutes
    enabled: true,
    handler: refreshDashboardData,
  },
];

// Initialize background jobs
export const initializeBackgroundJobs = () => {
  logger.info('Initializing background jobs...');
  
  backgroundJobs.forEach(job => {
    if (!job.enabled) {
      logger.info(`Skipping disabled job: ${job.name}`);
      return;
    }

    try {
      cron.schedule(job.schedule, async () => {
        const startTime = Date.now();
        logger.info(`Starting background job: ${job.name}`);
        
        try {
          await job.handler();
          const duration = Date.now() - startTime;
          logger.info(`Completed background job: ${job.name}`, { 
            duration: `${duration}ms` 
          });
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error(`Background job failed: ${job.name}`, { 
            error, 
            duration: `${duration}ms` 
          });
        }
      }, {
        scheduled: true,
        timezone: 'UTC',
      });

      logger.info(`Scheduled background job: ${job.name} (${job.schedule})`);
    } catch (error) {
      logger.error(`Failed to schedule background job: ${job.name}`, { error });
    }
  });

  logger.info(`Initialized ${backgroundJobs.filter(j => j.enabled).length} background jobs`);
};

// Manual job execution for testing/admin use
export const executeJob = async (jobName: string) => {
  const job = backgroundJobs.find(j => j.name === jobName);
  
  if (!job) {
    throw new Error(`Job not found: ${jobName}`);
  }

  logger.info(`Manually executing job: ${jobName}`);
  const startTime = Date.now();
  
  try {
    await job.handler();
    const duration = Date.now() - startTime;
    logger.info(`Manual job completed: ${jobName}`, { 
      duration: `${duration}ms` 
    });
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Manual job failed: ${jobName}`, { 
      error, 
      duration: `${duration}ms` 
    });
    throw error;
  }
};

// Get job status and statistics
export const getJobStatus = () => {
  return backgroundJobs.map(job => ({
    name: job.name,
    schedule: job.schedule,
    enabled: job.enabled,
    lastRun: job.lastRun,
    nextRun: job.nextRun,
  }));
};

// Graceful shutdown
export const shutdownBackgroundJobs = () => {
  logger.info('Shutting down background jobs...');
  cron.getTasks().forEach(task => {
    task.stop();
  });
  logger.info('Background jobs shutdown complete');
};
