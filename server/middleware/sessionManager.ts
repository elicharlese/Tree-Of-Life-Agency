import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from './logging';

const prisma = new PrismaClient();

interface SessionData {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
}

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_SESSIONS_PER_USER = 5;

// In-memory session store (use Redis in production)
const activeSessions = new Map<string, SessionData>();

// Generate session ID
const generateSessionId = (): string => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create session
export const createSession = async (
  userId: string,
  email: string,
  role: string,
  req: Request
): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> => {
  try {
    const sessionId = generateSessionId();
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Check existing sessions for user
    const userSessions = Array.from(activeSessions.values()).filter(
      session => session.userId === userId
    );

    // Remove oldest sessions if limit exceeded
    if (userSessions.length >= MAX_SESSIONS_PER_USER) {
      const oldestSessions = userSessions
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(0, userSessions.length - MAX_SESSIONS_PER_USER + 1);

      oldestSessions.forEach(session => {
        activeSessions.delete(session.sessionId);
        logger.info('Session removed due to limit', { 
          userId, 
          sessionId: session.sessionId 
        });
      });
    }

    // Create session data
    const sessionData: SessionData = {
      userId,
      email,
      role,
      sessionId,
      lastActivity: new Date(),
      ipAddress,
      userAgent,
    };

    // Store session
    activeSessions.set(sessionId, sessionData);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId, email, role, sessionId },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userId, sessionId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Update user's last login
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    // Log session creation
    await prisma.activity.create({
      data: {
        type: 'USER_LOGIN',
        description: 'User logged in',
        userId,
        metadata: {
          sessionId,
          ipAddress,
          userAgent,
        },
      },
    });

    logger.info('Session created', { userId, sessionId, ipAddress });

    return { accessToken, refreshToken, sessionId };
  } catch (error) {
    logger.error('Create session error', { error, userId });
    throw error;
  }
};

// Validate session
export const validateSession = (sessionId: string): SessionData | null => {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session expired
  const now = new Date();
  const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
  
  if (timeSinceLastActivity > SESSION_TIMEOUT) {
    activeSessions.delete(sessionId);
    logger.info('Session expired', { sessionId, userId: session.userId });
    return null;
  }

  // Update last activity
  session.lastActivity = now;
  activeSessions.set(sessionId, session);

  return session;
};

// Refresh access token
export const refreshAccessToken = async (
  refreshToken: string,
  req: Request
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as RefreshTokenPayload;
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Validate session
    const session = validateSession(payload.sessionId);
    if (!session) {
      return null;
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { 
        userId: session.userId, 
        email: session.email, 
        role: session.role, 
        sessionId: session.sessionId 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: session.userId, sessionId: session.sessionId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info('Token refreshed', { 
      userId: session.userId, 
      sessionId: session.sessionId 
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    logger.error('Refresh token error', { error });
    return null;
  }
};

// Destroy session
export const destroySession = async (sessionId: string): Promise<void> => {
  const session = activeSessions.get(sessionId);
  
  if (session) {
    activeSessions.delete(sessionId);
    
    // Log session destruction
    await prisma.activity.create({
      data: {
        type: 'USER_LOGOUT',
        description: 'User logged out',
        userId: session.userId,
        metadata: {
          sessionId,
        },
      },
    });

    logger.info('Session destroyed', { 
      userId: session.userId, 
      sessionId 
    });
  }
};

// Destroy all user sessions
export const destroyAllUserSessions = async (userId: string): Promise<void> => {
  const userSessions = Array.from(activeSessions.entries()).filter(
    ([_, session]) => session.userId === userId
  );

  userSessions.forEach(([sessionId, session]) => {
    activeSessions.delete(sessionId);
  });

  if (userSessions.length > 0) {
    await prisma.activity.create({
      data: {
        type: 'USER_LOGOUT_ALL',
        description: 'All user sessions terminated',
        userId,
        metadata: {
          sessionCount: userSessions.length,
        },
      },
    });

    logger.info('All user sessions destroyed', { 
      userId, 
      sessionCount: userSessions.length 
    });
  }
};

// Get user sessions
export const getUserSessions = (userId: string): SessionData[] => {
  return Array.from(activeSessions.values()).filter(
    session => session.userId === userId
  );
};

// Session middleware
export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.user?.sessionId;
  
  if (sessionId) {
    const session = validateSession(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
      });
    }
    
    // Add session data to request
    req.session = session;
  }
  
  next();
};

// Cleanup expired sessions (run periodically)
export const cleanupExpiredSessions = (): void => {
  const now = new Date();
  const expiredSessions: string[] = [];

  activeSessions.forEach((session, sessionId) => {
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      expiredSessions.push(sessionId);
    }
  });

  expiredSessions.forEach(sessionId => {
    const session = activeSessions.get(sessionId);
    activeSessions.delete(sessionId);
    
    if (session) {
      logger.info('Expired session cleaned up', { 
        userId: session.userId, 
        sessionId 
      });
    }
  });

  if (expiredSessions.length > 0) {
    logger.info('Session cleanup completed', { 
      cleanedSessions: expiredSessions.length 
    });
  }
};

// Start session cleanup interval
setInterval(cleanupExpiredSessions, 5 * 60 * 1000); // Every 5 minutes

// Get session statistics
export const getSessionStats = () => {
  const totalSessions = activeSessions.size;
  const userSessionCounts = new Map<string, number>();
  
  activeSessions.forEach(session => {
    const count = userSessionCounts.get(session.userId) || 0;
    userSessionCounts.set(session.userId, count + 1);
  });

  return {
    totalActiveSessions: totalSessions,
    uniqueUsers: userSessionCounts.size,
    averageSessionsPerUser: totalSessions / Math.max(userSessionCounts.size, 1),
    maxSessionsPerUser: Math.max(...Array.from(userSessionCounts.values()), 0),
  };
};
