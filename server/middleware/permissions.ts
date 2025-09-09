import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        isActive: boolean;
      };
    }
  }
}

// Role hierarchy mapping - higher values have more permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  CLIENT: 1,
  AGENT: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
  DEVELOPER: 5
};

// Permission levels
export enum PermissionLevel {
  PUBLIC = 'PUBLIC',           // No authentication required
  CLIENT = 'CLIENT',           // Client level access
  AGENT = 'AGENT',            // Agent level access  
  ADMIN = 'ADMIN',            // Admin level access
  SUPER_ADMIN = 'SUPER_ADMIN', // Super admin level access
  DEVELOPER = 'DEVELOPER'      // Developer level access
}

// Check if user has required role level
export const hasPermission = (userRole: UserRole, requiredLevel: PermissionLevel): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevelValue = ROLE_HIERARCHY[requiredLevel as UserRole];
  
  return userLevel >= requiredLevelValue;
};

// Middleware factory to check permissions
export const requirePermission = (level: PermissionLevel) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow public access
    if (level === PermissionLevel.PUBLIC) {
      return next();
    }

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(403).json({ 
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check permission level
    if (!hasPermission(req.user.role, level)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: level,
        current: req.user.role
      });
    }

    next();
  };
};

// Specific permission middleware functions
export const requireAuth = requirePermission(PermissionLevel.CLIENT);
export const requireClient = requirePermission(PermissionLevel.CLIENT);
export const requireAgent = requirePermission(PermissionLevel.AGENT);
export const requireAdmin = requirePermission(PermissionLevel.ADMIN);
export const requireSuperAdmin = requirePermission(PermissionLevel.SUPER_ADMIN);
export const requireDeveloper = requirePermission(PermissionLevel.DEVELOPER);

// Resource ownership middleware - check if user owns/has access to resource
export const requireResourceAccess = (resourceType: 'customer' | 'order' | 'project' | 'lead') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID required' });
      }

      // Super admins and developers have access to everything
      if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DEVELOPER') {
        return next();
      }

      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      let hasAccess = false;

      try {
        switch (resourceType) {
          case 'customer':
            const customer = await prisma.customer.findFirst({
              where: {
                id: resourceId,
                OR: [
                  { assignedToId: req.user.id },
                  { assignedToId: req.user.id }
                ]
              }
            });
            hasAccess = !!customer;
            break;

          case 'order':
            const order = await prisma.order.findFirst({
              where: {
                id: resourceId,
                OR: [
                  { assignedToId: req.user.id },
                  { userId: req.user.id }
                ]
              }
            });
            hasAccess = !!order;
            break;

          case 'project':
            const project = await prisma.project.findFirst({
              where: {
                id: resourceId,
                OR: [
                  { assignedToId: req.user.id },
                  { assignedToId: req.user.id }
                ]
              }
            });
            hasAccess = !!project;
            break;

          case 'lead':
            const lead = await prisma.lead.findFirst({
              where: {
                id: resourceId,
                OR: [
                  { assignedToId: req.user.id },
                  { assignedToId: req.user.id }
                ]
              }
            });
            hasAccess = !!lead;
            break;

          default:
            return res.status(400).json({ error: 'Invalid resource type' });
        }
      } finally {
        await prisma.$disconnect();
      }

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied to this resource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Team-based access control
export const requireTeamAccess = (teamId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Use teamId from params if not provided
      const targetTeamId = teamId || req.params.teamId;
      
      if (!targetTeamId) {
        return res.status(400).json({ error: 'Team ID required' });
      }

      // Super admins have access to all teams
      if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DEVELOPER') {
        return next();
      }

      // Import Prisma client dynamically
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        // Check if user is part of the team
        const user = await prisma.user.findFirst({
          where: {
            id: req.user.id,
            // Add team membership check when team model is implemented
            isActive: true
          }
        });

        if (!user) {
          return res.status(403).json({ 
            error: 'Access denied to this team',
            code: 'TEAM_ACCESS_DENIED'
          });
        }

        next();
      } finally {
        await prisma.$disconnect();
      }
    } catch (error) {
      console.error('Team access check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Rate limiting based on user role
export const getRateLimitByRole = (role: UserRole): { windowMs: number; max: number } => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'DEVELOPER':
      return { windowMs: 15 * 60 * 1000, max: 1000 }; // 1000 requests per 15 minutes

    case 'ADMIN':
      return { windowMs: 15 * 60 * 1000, max: 500 }; // 500 requests per 15 minutes

    case 'AGENT':
      return { windowMs: 15 * 60 * 1000, max: 200 }; // 200 requests per 15 minutes

    case 'CLIENT':
    default:
      return { windowMs: 15 * 60 * 1000, max: 100 }; // 100 requests per 15 minutes
  }
};

// Feature flags based on role
export const hasFeatureAccess = (userRole: UserRole, feature: string): boolean => {
  const features: Record<string, UserRole[]> = {
    'admin_panel': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'user_management': ['SUPER_ADMIN', 'DEVELOPER'],
    'invitation_management': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'analytics_dashboard': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'project_management': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'customer_management': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'order_processing': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'payment_processing': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'storefront_access': ['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'wallet_connection': ['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'api_access': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
    'system_settings': ['SUPER_ADMIN', 'DEVELOPER'],
    'debug_mode': ['DEVELOPER']
  };

  const allowedRoles = features[feature];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};

// Middleware to check feature access
export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasFeatureAccess(req.user.role, feature)) {
      return res.status(403).json({ 
        error: `Access denied to feature: ${feature}`,
        code: 'FEATURE_ACCESS_DENIED',
        feature
      });
    }

    next();
  };
};
