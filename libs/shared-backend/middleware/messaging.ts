import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

// Optional Socket.IO integration - will be undefined if not installed
let SocketIOServer: any;
try {
  SocketIOServer = require('socket.io').Server;
} catch (error) {
  console.warn('Socket.IO not installed - real-time messaging disabled');
}

// Message types for different events
export enum MessageType {
  INVITATION_SENT = 'invitation_sent',
  INVITATION_ACCEPTED = 'invitation_accepted',
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  ROLE_CHANGED = 'role_changed',
  SYSTEM_NOTIFICATION = 'system_notification',
  ACTIVITY_UPDATE = 'activity_update',
  CRM_UPDATE = 'crm_update'
}

export interface Message {
  id: string;
  type: MessageType;
  data: any;
  timestamp: Date;
  userId?: string;
  userRole?: UserRole;
  targetUsers?: string[];
  targetRoles?: UserRole[];
}

// In-memory message queue (use Redis in production)
class MessageQueue {
  private messages: Message[] = [];
  private subscribers: Map<string, (message: Message) => void> = new Map();

  publish(message: Message): void {
    this.messages.push(message);
    
    // Notify all subscribers
    this.subscribers.forEach(callback => {
      callback(message);
    });

    // Keep only last 1000 messages
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000);
    }
  }

  subscribe(id: string, callback: (message: Message) => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  getRecentMessages(limit: number = 50): Message[] {
    return this.messages.slice(-limit);
  }
}

const messageQueue = new MessageQueue();

// Socket.IO integration
let io: any = null;

export const setupMessaging = (socketServer: any) => {
  io = socketServer;

  // Subscribe to message queue
  messageQueue.subscribe('socket-io', (message: Message) => {
    // Broadcast to specific users or roles
    if (message.targetUsers && message.targetUsers.length > 0) {
      message.targetUsers.forEach(userId => {
        io?.to(`user:${userId}`).emit('message', message);
      });
    } else if (message.targetRoles && message.targetRoles.length > 0) {
      message.targetRoles.forEach(role => {
        io?.to(`role:${role}`).emit('message', message);
      });
    } else {
      // Broadcast to all connected clients
      io?.emit('message', message);
    }
  });

  // Handle socket connections
  io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room after authentication
    socket.on('authenticate', (data: { userId: string; role: UserRole }) => {
      socket.join(`user:${data.userId}`);
      socket.join(`role:${data.role}`);
      
      // Send recent messages to newly connected user
      const recentMessages = messageQueue.getRecentMessages(10);
      socket.emit('recent_messages', recentMessages);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

// Middleware to publish messages for specific events
export const publishMessage = (type: MessageType, getData: (req: Request, res: Response) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json
    const originalJson = res.json;

    res.json = function(data: any) {
      // Only publish on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const messageData = getData(req, res);
        
        const message: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          data: messageData,
          timestamp: new Date(),
          userId: (req as any).user?.id,
          userRole: (req as any).user?.role
        };

        messageQueue.publish(message);
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

// Specific message publishers for common events
export const publishInvitationSent = publishMessage(
  MessageType.INVITATION_SENT,
  (req, res) => ({
    email: req.body.email,
    role: req.body.role,
    invitedBy: (req as any).user?.id
  })
);

export const publishUserRegistered = publishMessage(
  MessageType.USER_REGISTERED,
  (req, res) => ({
    userId: res.locals.userId || req.body.id,
    email: req.body.email,
    role: req.body.role
  })
);

export const publishUserLogin = publishMessage(
  MessageType.USER_LOGIN,
  (req, res) => ({
    userId: (req as any).user?.id,
    email: (req as any).user?.email,
    role: (req as any).user?.role,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
);

// Notification middleware for admin users
export const notifyAdmins = (message: string, data?: any) => {
  const notification: Message = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: MessageType.SYSTEM_NOTIFICATION,
    data: { message, ...data },
    timestamp: new Date(),
    targetRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
  };

  messageQueue.publish(notification);
};

// Activity logging middleware
export const logActivity = (action: string, getDetails: (req: Request) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const activity: Message = {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: MessageType.ACTIVITY_UPDATE,
          data: {
            action,
            details: getDetails(req),
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          timestamp: new Date(),
          userId: (req as any).user?.id,
          userRole: (req as any).user?.role
        };

        messageQueue.publish(activity);
      }
    });

    next();
  };
};

export { messageQueue };
