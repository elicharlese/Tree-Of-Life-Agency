import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';
import { 
  publishUserOnline, 
  publishUserOffline, 
  publishMessageSent,
  publishNewActivity,
  publishDashboardUpdate
} from '../graphql/pubsub';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
}

// Store active connections
const activeConnections = new Map<string, AuthenticatedSocket>();
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, firstName: true, lastName: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userName = `${user.firstName} ${user.lastName}`;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error', { error });
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const userRole = socket.userRole!;
    const userName = socket.userName!;

    logger.info('User connected via WebSocket', { 
      userId, 
      socketId: socket.id, 
      userRole 
    });

    // Store connection
    activeConnections.set(socket.id, socket);
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);
    socket.join(`role:${userRole}`);

    // Notify others of user coming online
    publishUserOnline({
      id: userId,
      name: userName,
      role: userRole,
      connectedAt: new Date(),
    });

    // Send initial connection success
    socket.emit('connected', {
      message: 'Connected successfully',
      userId,
      userName,
      userRole,
    });

    // Handle real-time messaging
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content, type = 'MESSAGE' } = data;

        // Validate input
        if (!recipientId || !content) {
          socket.emit('error', { message: 'Recipient and content are required' });
          return;
        }

        // Check if recipient exists
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { id: true, firstName: true, lastName: true, isActive: true },
        });

        if (!recipient || !recipient.isActive) {
          socket.emit('error', { message: 'Recipient not found or inactive' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            recipientId,
            content,
            type,
            status: 'SENT',
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

        // Send to recipient if online
        io.to(`user:${recipientId}`).emit('new_message', message);
        
        // Send confirmation to sender
        socket.emit('message_sent', message);

        // Publish to GraphQL subscriptions
        publishMessageSent(message);

        logger.info('Message sent via WebSocket', {
          messageId: message.id,
          senderId: userId,
          recipientId,
        });
      } catch (error) {
        logger.error('Send message error', { error, userId });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { recipientId } = data;
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('user_typing', {
          userId,
          userName,
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { recipientId } = data;
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('user_stopped_typing', {
          userId,
          userName,
        });
      }
    });

    // Handle real-time activity updates
    socket.on('activity_update', async (data) => {
      try {
        const { type, description, entityType, entityId, metadata } = data;

        // Create activity
        const activity = await prisma.activity.create({
          data: {
            type,
            description,
            userId,
            entityType,
            entityId,
            metadata: metadata || {},
          },
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        });

        // Broadcast activity to relevant users
        if (userRole === 'AGENT') {
          // Agents - broadcast to admins and themselves
          io.to(`role:ADMIN`).emit('new_activity', activity);
          io.to(`role:SUPER_ADMIN`).emit('new_activity', activity);
          io.to(`role:DEVELOPER`).emit('new_activity', activity);
        } else {
          // Admins - broadcast to all
          io.emit('new_activity', activity);
        }

        // Publish to GraphQL subscriptions
        publishNewActivity(activity);

        logger.info('Activity update broadcasted', {
          activityId: activity.id,
          type,
          userId,
        });
      } catch (error) {
        logger.error('Activity update error', { error, userId });
        socket.emit('error', { message: 'Failed to update activity' });
      }
    });

    // Handle dashboard data requests
    socket.on('request_dashboard_data', async () => {
      try {
        // Role-based filtering
        const userFilter = userRole === 'AGENT' ? { assignedTo: userId } : {};

        // Get basic metrics
        const [customerCount, leadCount, projectCount] = await Promise.all([
          prisma.customer.count({ where: userFilter }),
          prisma.lead.count({ where: userFilter }),
          prisma.project.count({ where: userFilter }),
        ]);

        const dashboardData = {
          customers: customerCount,
          leads: leadCount,
          projects: projectCount,
          lastUpdated: new Date(),
        };

        socket.emit('dashboard_data', dashboardData);
      } catch (error) {
        logger.error('Dashboard data request error', { error, userId });
        socket.emit('error', { message: 'Failed to fetch dashboard data' });
      }
    });

    // Handle presence updates
    socket.on('update_presence', (data) => {
      const { status, activity } = data;
      
      socket.broadcast.emit('user_presence_update', {
        userId,
        userName,
        status,
        activity,
        updatedAt: new Date(),
      });
    });

    // Handle file sharing notifications
    socket.on('file_shared', async (data) => {
      try {
        const { recipientId, fileName, fileSize, fileType } = data;

        if (recipientId) {
          io.to(`user:${recipientId}`).emit('file_received', {
            senderId: userId,
            senderName: userName,
            fileName,
            fileSize,
            fileType,
            sharedAt: new Date(),
          });
        }

        logger.info('File sharing notification sent', {
          senderId: userId,
          recipientId,
          fileName,
        });
      } catch (error) {
        logger.error('File sharing notification error', { error, userId });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected from WebSocket', { 
        userId, 
        socketId: socket.id, 
        reason 
      });

      // Remove connection
      activeConnections.delete(socket.id);
      
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        
        // If no more sockets for this user, mark as offline
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          
          publishUserOffline({
            id: userId,
            name: userName,
            role: userRole,
            disconnectedAt: new Date(),
          });
        }
      }
    });

    // Handle custom room joining
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      socket.emit('joined_room', { room: roomName });
      logger.info('User joined room', { userId, room: roomName });
    });

    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      socket.emit('left_room', { room: roomName });
      logger.info('User left room', { userId, room: roomName });
    });
  });

  return io;
};

// Helper functions for broadcasting to specific groups
export const broadcastToRole = (io: SocketIOServer, role: string, event: string, data: any) => {
  io.to(`role:${role}`).emit(event, data);
};

export const broadcastToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const broadcastToAll = (io: SocketIOServer, event: string, data: any) => {
  io.emit(event, data);
};

// Get online users
export const getOnlineUsers = () => {
  const onlineUsers = Array.from(userSockets.entries()).map(([userId, socketIds]) => {
    const socket = activeConnections.get(Array.from(socketIds)[0]);
    return {
      userId,
      userName: socket?.userName,
      userRole: socket?.userRole,
      connectionCount: socketIds.size,
    };
  });
  
  return onlineUsers;
};

// Get connection statistics
export const getConnectionStats = () => {
  return {
    totalConnections: activeConnections.size,
    uniqueUsers: userSockets.size,
    averageConnectionsPerUser: userSockets.size > 0 ? activeConnections.size / userSockets.size : 0,
  };
};
