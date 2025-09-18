import { PrismaClient } from '@prisma/client';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './pubsub';
import { logger } from '../middleware/logging';

const prisma = new PrismaClient();

// Helper function to check authentication
const requireAuth = (user: any) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};

// Helper function to check role permissions
const requireRole = (user: any, allowedRoles: string[]) => {
  requireAuth(user);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return user;
};

export const resolvers = {
  Query: {
    // User queries
    me: async (_: any, __: any, { user }: any) => {
      requireAuth(user);
      return await prisma.user.findUnique({
        where: { id: user.userId },
      });
    },

    users: async (_: any, { filter, pagination, sort }: any, { user }: any) => {
      requireRole(user, ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']);
      
      const where: any = {};
      if (filter?.search) {
        where.OR = [
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      const skip = ((pagination?.page || 1) - 1) * (pagination?.limit || 10);
      
      return await prisma.user.findMany({
        where,
        skip,
        take: pagination?.limit || 10,
        orderBy: { [sort?.field || 'createdAt']: sort?.order?.toLowerCase() || 'desc' },
      });
    },

    user: async (_: any, { id }: any, { user }: any) => {
      requireAuth(user);
      
      // Users can view their own profile, admins can view any profile
      if (user.userId !== id && !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(user.role)) {
        throw new ForbiddenError('Access denied');
      }

      return await prisma.user.findUnique({
        where: { id },
      });
    },

    // Customer queries
    customers: async (_: any, { filter, pagination, sort }: any, { user }: any) => {
      requireAuth(user);
      
      const where: any = {};
      
      // Role-based filtering
      if (user.role === 'AGENT') {
        where.assignedTo = user.userId;
      }
      
      if (filter?.search) {
        where.OR = [
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
          { company: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      if (filter?.status) where.status = filter.status;
      if (filter?.assignedTo) where.assignedTo = filter.assignedTo;

      const skip = ((pagination?.page || 1) - 1) * (pagination?.limit || 10);
      
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: pagination?.limit || 10,
          orderBy: { [sort?.field || 'createdAt']: sort?.order?.toLowerCase() || 'desc' },
          include: {
            assignedUser: true,
            projects: true,
            orders: true,
          },
        }),
        prisma.customer.count({ where }),
      ]);

      return {
        customers,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total,
          totalPages: Math.ceil(total / (pagination?.limit || 10)),
          hasNext: skip + customers.length < total,
          hasPrev: (pagination?.page || 1) > 1,
        },
      };
    },

    customer: async (_: any, { id }: any, { user }: any) => {
      requireAuth(user);
      
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          assignedUser: true,
          projects: true,
          orders: true,
          communications: true,
        },
      });

      if (!customer) {
        throw new UserInputError('Customer not found');
      }

      // Role-based access control
      if (user.role === 'AGENT' && customer.assignedTo !== user.userId) {
        throw new ForbiddenError('Access denied');
      }

      return customer;
    },

    // Lead queries
    leads: async (_: any, { filter, pagination, sort }: any, { user }: any) => {
      requireAuth(user);
      
      const where: any = {};
      
      // Role-based filtering
      if (user.role === 'AGENT') {
        where.assignedTo = user.userId;
      }
      
      if (filter?.search) {
        where.OR = [
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
          { company: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      if (filter?.status) where.status = filter.status;
      if (filter?.assignedTo) where.assignedTo = filter.assignedTo;

      const skip = ((pagination?.page || 1) - 1) * (pagination?.limit || 10);
      
      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: pagination?.limit || 10,
          orderBy: { [sort?.field || 'createdAt']: sort?.order?.toLowerCase() || 'desc' },
          include: {
            assignedUser: true,
          },
        }),
        prisma.lead.count({ where }),
      ]);

      return {
        leads,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total,
          totalPages: Math.ceil(total / (pagination?.limit || 10)),
          hasNext: skip + leads.length < total,
          hasPrev: (pagination?.page || 1) > 1,
        },
      };
    },

    lead: async (_: any, { id }: any, { user }: any) => {
      requireAuth(user);
      
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          assignedUser: true,
        },
      });

      if (!lead) {
        throw new UserInputError('Lead not found');
      }

      // Role-based access control
      if (user.role === 'AGENT' && lead.assignedTo !== user.userId) {
        throw new ForbiddenError('Access denied');
      }

      return lead;
    },

    // Dashboard queries
    dashboardAnalytics: async (_: any, { dateRange }: any, { user }: any) => {
      requireAuth(user);
      
      // Build date filter
      let dateFilter = {};
      if (dateRange) {
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
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
      const userFilter = user.role === 'AGENT' ? { assignedTo: user.userId } : {};

      // Get metrics
      const [customerStats, leadStats, projectStats, recentActivities] = await Promise.all([
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
            ...(user.role === 'AGENT' ? { userId: user.userId } : {}),
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
      ]);

      const [totalCustomers, activeCustomers, prospectCustomers, customerValue] = customerStats;
      const [totalLeads, newLeads, qualifiedLeads, wonLeads, wonValue] = leadStats;
      const [totalProjects, activeProjects, completedProjects] = projectStats;

      // Calculate conversion rates
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
      const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

      return {
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
        salesPipeline: [],
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          userName: `${activity.user.firstName} ${activity.user.lastName}`,
          createdAt: activity.createdAt,
        })),
      };
    },

    salesFunnel: async (_: any, __: any, { user }: any) => {
      requireAuth(user);
      
      const userFilter = user.role === 'AGENT' ? { assignedTo: user.userId } : {};
      
      const funnelData = await prisma.lead.groupBy({
        by: ['status'],
        where: userFilter,
        _count: { status: true },
        _sum: { estimatedValue: true },
      });

      return funnelData.map(stage => ({
        status: stage.status,
        count: stage._count.status,
        value: stage._sum.estimatedValue || 0,
      }));
    },
  },

  Mutation: {
    // Customer mutations
    createCustomer: async (_: any, { input }: any, { user }: any) => {
      requireAuth(user);

      // Check if email already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: input.email },
      });

      if (existingCustomer) {
        throw new UserInputError('Customer with this email already exists');
      }

      // Auto-assign to current user if agent and no assignedTo specified
      if (!input.assignedTo && user.role === 'AGENT') {
        input.assignedTo = user.userId;
      }

      const customer = await prisma.customer.create({
        data: input,
        include: {
          assignedUser: true,
          projects: true,
          orders: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'CUSTOMER_CREATED',
          description: `Customer ${customer.firstName} ${customer.lastName} was created`,
          userId: user.userId,
          entityType: 'CUSTOMER',
          entityId: customer.id,
        },
      });

      // Publish subscription
      pubsub.publish('CUSTOMER_UPDATED', { customerUpdated: customer });

      logger.info('Customer created via GraphQL', { 
        customerId: customer.id, 
        createdBy: user.userId 
      });

      return customer;
    },

    updateCustomer: async (_: any, { id, input }: any, { user }: any) => {
      requireAuth(user);

      const existingCustomer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer) {
        throw new UserInputError('Customer not found');
      }

      // Role-based access control
      if (user.role === 'AGENT' && existingCustomer.assignedTo !== user.userId) {
        throw new ForbiddenError('Access denied');
      }

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
        include: {
          assignedUser: true,
          projects: true,
          orders: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'CUSTOMER_UPDATED',
          description: `Customer ${customer.firstName} ${customer.lastName} was updated`,
          userId: user.userId,
          entityType: 'CUSTOMER',
          entityId: customer.id,
        },
      });

      // Publish subscription
      pubsub.publish('CUSTOMER_UPDATED', { customerUpdated: customer });

      return customer;
    },

    // Lead mutations
    createLead: async (_: any, { input }: any, { user }: any) => {
      requireAuth(user);

      // Auto-assign to current user if agent and no assignedTo specified
      if (!input.assignedTo && user.role === 'AGENT') {
        input.assignedTo = user.userId;
      }

      const lead = await prisma.lead.create({
        data: input,
        include: {
          assignedUser: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'LEAD_CREATED',
          description: `Lead ${lead.firstName} ${lead.lastName} was created`,
          userId: user.userId,
          entityType: 'LEAD',
          entityId: lead.id,
        },
      });

      // Publish subscription
      pubsub.publish('LEAD_UPDATED', { leadUpdated: lead });

      return lead;
    },

    convertLeadToCustomer: async (_: any, { id }: any, { user }: any) => {
      requireAuth(user);

      const lead = await prisma.lead.findUnique({ where: { id } });

      if (!lead) {
        throw new UserInputError('Lead not found');
      }

      if (lead.status === 'WON') {
        throw new UserInputError('Lead already converted');
      }

      // Role-based access control
      if (user.role === 'AGENT' && lead.assignedTo !== user.userId) {
        throw new ForbiddenError('Access denied');
      }

      // Create customer from lead
      const customer = await prisma.customer.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: 'ACTIVE',
          source: lead.source,
          assignedTo: lead.assignedTo,
          tags: lead.tags,
          notes: lead.notes,
        },
        include: {
          assignedUser: true,
          projects: true,
          orders: true,
        },
      });

      // Update lead status
      await prisma.lead.update({
        where: { id },
        data: {
          status: 'WON',
          convertedAt: new Date(),
          convertedToCustomerId: customer.id,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'LEAD_CONVERTED',
          description: `Lead ${lead.firstName} ${lead.lastName} converted to customer`,
          userId: user.userId,
          entityType: 'LEAD',
          entityId: lead.id,
        },
      });

      // Publish subscriptions
      pubsub.publish('CUSTOMER_UPDATED', { customerUpdated: customer });
      pubsub.publish('LEAD_UPDATED', { leadUpdated: lead });

      return customer;
    },
  },

  Subscription: {
    customerUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['CUSTOMER_UPDATED']),
        (payload, variables) => {
          return !variables.customerId || payload.customerUpdated.id === variables.customerId;
        }
      ),
    },

    leadUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['LEAD_UPDATED']),
        (payload, variables) => {
          return !variables.leadId || payload.leadUpdated.id === variables.leadId;
        }
      ),
    },

    newActivity: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NEW_ACTIVITY']),
        (payload, variables) => {
          return !variables.userId || payload.newActivity.userId === variables.userId;
        }
      ),
    },

    dashboardUpdated: {
      subscribe: () => pubsub.asyncIterator(['DASHBOARD_UPDATED']),
    },
  },

  // Field resolvers
  Customer: {
    assignedUser: async (parent: any) => {
      if (!parent.assignedTo) return null;
      return await prisma.user.findUnique({
        where: { id: parent.assignedTo },
      });
    },
    projects: async (parent: any) => {
      return await prisma.project.findMany({
        where: { customerId: parent.id },
      });
    },
    orders: async (parent: any) => {
      return await prisma.order.findMany({
        where: { customerId: parent.id },
      });
    },
    communications: async (parent: any) => {
      return await prisma.communicationLog.findMany({
        where: { customerId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Lead: {
    assignedUser: async (parent: any) => {
      if (!parent.assignedTo) return null;
      return await prisma.user.findUnique({
        where: { id: parent.assignedTo },
      });
    },
  },

  Project: {
    customer: async (parent: any) => {
      return await prisma.customer.findUnique({
        where: { id: parent.customerId },
      });
    },
    assignedUser: async (parent: any) => {
      if (!parent.assignedTo) return null;
      return await prisma.user.findUnique({
        where: { id: parent.assignedTo },
      });
    },
  },

  CommunicationLog: {
    user: async (parent: any) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    customer: async (parent: any) => {
      if (!parent.customerId) return null;
      return await prisma.customer.findUnique({
        where: { id: parent.customerId },
      });
    },
    lead: async (parent: any) => {
      if (!parent.leadId) return null;
      return await prisma.lead.findUnique({
        where: { id: parent.leadId },
      });
    },
  },
};
