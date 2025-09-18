import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';

const prisma = new PrismaClient();

// Get dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { dateRange } = req.query;

    // Date range filter
    let dateFilter = {};
    if (dateRange) {
      const range = dateRange as string;
      const now = new Date();
      let startDate = new Date();

      switch (range) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      };
    }

    // Role-based filtering
    const userFilter = userRole === 'AGENT' ? { assignedTo: userId } : {};

    // Get core metrics
    const [
      customerStats,
      leadStats,
      projectStats,
      recentActivities,
      salesPipeline,
      monthlyRevenue,
    ] = await Promise.all([
      // Customer statistics
      prisma.$transaction([
        prisma.customer.count({ where: { ...userFilter, ...dateFilter } }),
        prisma.customer.count({ where: { ...userFilter, status: 'ACTIVE', ...dateFilter } }),
        prisma.customer.count({ where: { ...userFilter, status: 'PROSPECT', ...dateFilter } }),
        prisma.customer.aggregate({
          where: userFilter,
          _sum: { totalValue: true },
        }),
      ]),

      // Lead statistics
      prisma.$transaction([
        prisma.lead.count({ where: { ...userFilter, ...dateFilter } }),
        prisma.lead.count({ where: { ...userFilter, status: 'NEW', ...dateFilter } }),
        prisma.lead.count({ where: { ...userFilter, status: 'QUALIFIED', ...dateFilter } }),
        prisma.lead.count({ where: { ...userFilter, status: 'WON', ...dateFilter } }),
        prisma.lead.aggregate({
          where: { ...userFilter, status: 'WON' },
          _sum: { estimatedValue: true },
        }),
      ]),

      // Project statistics
      prisma.$transaction([
        prisma.project.count({ where: { ...userFilter, ...dateFilter } }),
        prisma.project.count({ where: { ...userFilter, status: 'ACTIVE', ...dateFilter } }),
        prisma.project.count({ where: { ...userFilter, status: 'COMPLETED', ...dateFilter } }),
      ]),

      // Recent activities
      prisma.activity.findMany({
        where: {
          ...dateFilter,
          ...(userRole === 'AGENT' ? { userId } : {}),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      }),

      // Sales pipeline
      prisma.lead.groupBy({
        by: ['status'],
        where: userFilter,
        _count: { status: true },
        _sum: { estimatedValue: true },
      }),

      // Monthly revenue trend
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as deals_won,
          COALESCE(SUM("estimatedValue"), 0) as revenue
        FROM "Lead" 
        WHERE "status" = 'WON' 
          AND "createdAt" >= ${new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)}
          ${userRole === 'AGENT' ? prisma.$queryRaw`AND "assignedTo" = ${userId}` : prisma.$queryRaw``}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 6
      `,
    ]);

    const [totalCustomers, activeCustomers, prospectCustomers, customerValue] = customerStats;
    const [totalLeads, newLeads, qualifiedLeads, wonLeads, wonValue] = leadStats;
    const [totalProjects, activeProjects, completedProjects] = projectStats;

    // Calculate conversion rates
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          prospectCustomers,
          totalCustomerValue: customerValue._sum.totalValue || 0,
          totalLeads,
          newLeads,
          qualifiedLeads,
          wonLeads,
          wonValue: wonValue._sum.estimatedValue || 0,
          conversionRate: Math.round(conversionRate * 100) / 100,
          qualificationRate: Math.round(qualificationRate * 100) / 100,
          totalProjects,
          activeProjects,
          completedProjects,
        },
        salesPipeline: salesPipeline.map(stage => ({
          status: stage.status,
          count: stage._count.status,
          value: stage._sum.estimatedValue || 0,
        })),
        monthlyRevenue: monthlyRevenue,
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          userName: `${activity.user.firstName} ${activity.user.lastName}`,
          createdAt: activity.createdAt,
        })),
      },
    });
  } catch (error) {
    logger.error('Get dashboard analytics error', { error, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get user performance metrics
export const getUserPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?.userId;
    const userRole = req.user?.role;

    // Check permissions
    if (userRole === 'AGENT' && targetUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const userId = targetUserId || currentUserId;

    // Get user performance data
    const [
      userInfo,
      customerMetrics,
      leadMetrics,
      projectMetrics,
      activityMetrics,
    ] = await Promise.all([
      // User info
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true, role: true },
      }),

      // Customer metrics
      prisma.$transaction([
        prisma.customer.count({ where: { assignedTo: userId } }),
        prisma.customer.count({ where: { assignedTo: userId, status: 'ACTIVE' } }),
        prisma.customer.aggregate({
          where: { assignedTo: userId },
          _sum: { totalValue: true },
        }),
      ]),

      // Lead metrics
      prisma.$transaction([
        prisma.lead.count({ where: { assignedTo: userId } }),
        prisma.lead.count({ where: { assignedTo: userId, status: 'WON' } }),
        prisma.lead.aggregate({
          where: { assignedTo: userId, status: 'WON' },
          _sum: { estimatedValue: true },
        }),
      ]),

      // Project metrics
      prisma.$transaction([
        prisma.project.count({ where: { assignedTo: userId } }),
        prisma.project.count({ where: { assignedTo: userId, status: 'COMPLETED' } }),
      ]),

      // Activity metrics (last 30 days)
      prisma.activity.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const [totalCustomers, activeCustomers, customerValue] = customerMetrics;
    const [totalLeads, wonLeads, wonValue] = leadMetrics;
    const [totalProjects, completedProjects] = projectMetrics;

    // Calculate performance metrics
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const averageDealSize = wonLeads > 0 ? (wonValue._sum.estimatedValue || 0) / wonLeads : 0;
    const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          name: `${userInfo.firstName} ${userInfo.lastName}`,
          email: userInfo.email,
          role: userInfo.role,
        },
        metrics: {
          customers: {
            total: totalCustomers,
            active: activeCustomers,
            totalValue: customerValue._sum.totalValue || 0,
          },
          leads: {
            total: totalLeads,
            won: wonLeads,
            conversionRate: Math.round(conversionRate * 100) / 100,
            totalRevenue: wonValue._sum.estimatedValue || 0,
            averageDealSize: Math.round(averageDealSize * 100) / 100,
          },
          projects: {
            total: totalProjects,
            completed: completedProjects,
            completionRate: Math.round(projectCompletionRate * 100) / 100,
          },
          activity: {
            totalLast30Days: activityMetrics,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Get user performance metrics error', { error, userId: req.params.userId });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get team performance overview
export const getTeamPerformance = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    // Only admins can view team performance
    if (!['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Get all agents and their performance
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT', isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const teamPerformance = await Promise.all(
      agents.map(async (agent) => {
        const [customerCount, leadMetrics, projectCount] = await Promise.all([
          prisma.customer.count({ where: { assignedTo: agent.id } }),
          prisma.$transaction([
            prisma.lead.count({ where: { assignedTo: agent.id } }),
            prisma.lead.count({ where: { assignedTo: agent.id, status: 'WON' } }),
            prisma.lead.aggregate({
              where: { assignedTo: agent.id, status: 'WON' },
              _sum: { estimatedValue: true },
            }),
          ]),
          prisma.project.count({ where: { assignedTo: agent.id } }),
        ]);

        const [totalLeads, wonLeads, wonValue] = leadMetrics;
        const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

        return {
          agent: {
            id: agent.id,
            name: `${agent.firstName} ${agent.lastName}`,
            email: agent.email,
          },
          metrics: {
            customers: customerCount,
            leads: totalLeads,
            conversions: wonLeads,
            conversionRate: Math.round(conversionRate * 100) / 100,
            revenue: wonValue._sum.estimatedValue || 0,
            projects: projectCount,
          },
        };
      })
    );

    // Calculate team totals
    const teamTotals = teamPerformance.reduce(
      (acc, agent) => ({
        customers: acc.customers + agent.metrics.customers,
        leads: acc.leads + agent.metrics.leads,
        conversions: acc.conversions + agent.metrics.conversions,
        revenue: acc.revenue + agent.metrics.revenue,
        projects: acc.projects + agent.metrics.projects,
      }),
      { customers: 0, leads: 0, conversions: 0, revenue: 0, projects: 0 }
    );

    const teamConversionRate = teamTotals.leads > 0 ? (teamTotals.conversions / teamTotals.leads) * 100 : 0;

    res.json({
      success: true,
      data: {
        teamOverview: {
          totalAgents: agents.length,
          totalCustomers: teamTotals.customers,
          totalLeads: teamTotals.leads,
          totalConversions: teamTotals.conversions,
          teamConversionRate: Math.round(teamConversionRate * 100) / 100,
          totalRevenue: teamTotals.revenue,
          totalProjects: teamTotals.projects,
        },
        agentPerformance: teamPerformance.sort((a, b) => b.metrics.revenue - a.metrics.revenue),
      },
    });
  } catch (error) {
    logger.error('Get team performance error', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get sales funnel data
export const getSalesFunnel = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    // Role-based filtering
    const userFilter = userRole === 'AGENT' ? { assignedTo: userId } : {};

    // Get funnel data
    const funnelData = await prisma.lead.groupBy({
      by: ['status'],
      where: userFilter,
      _count: { status: true },
      _sum: { estimatedValue: true },
    });

    // Define funnel stages in order
    const stageOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    
    const funnel = stageOrder.map(status => {
      const stageData = funnelData.find(item => item.status === status);
      return {
        stage: status,
        count: stageData?._count.status || 0,
        value: stageData?._sum.estimatedValue || 0,
      };
    });

    // Calculate conversion rates between stages
    const funnelWithConversion = funnel.map((stage, index) => {
      let conversionRate = 0;
      if (index > 0 && funnel[index - 1].count > 0) {
        conversionRate = (stage.count / funnel[index - 1].count) * 100;
      }
      
      return {
        ...stage,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    });

    res.json({
      success: true,
      data: {
        funnel: funnelWithConversion,
        summary: {
          totalLeads: funnel.reduce((sum, stage) => sum + stage.count, 0),
          totalValue: funnel.reduce((sum, stage) => sum + stage.value, 0),
          overallConversionRate: funnel[0].count > 0 ? 
            Math.round((funnel.find(s => s.stage === 'WON')?.count || 0) / funnel[0].count * 10000) / 100 : 0,
        },
      },
    });
  } catch (error) {
    logger.error('Get sales funnel error', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
