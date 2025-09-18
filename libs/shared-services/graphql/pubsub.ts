import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

// Use Redis for production, in-memory for development
const createPubSub = () => {
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL);
    
    return new RedisPubSub({
      publisher: redis,
      subscriber: redis.duplicate(),
    });
  }
  
  // Fallback to in-memory PubSub for development
  return new PubSub();
};

export const pubsub = createPubSub();

// Event types for better type safety
export const SUBSCRIPTION_EVENTS = {
  CUSTOMER_UPDATED: 'CUSTOMER_UPDATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  NEW_ACTIVITY: 'NEW_ACTIVITY',
  DASHBOARD_UPDATED: 'DASHBOARD_UPDATED',
  COMMUNICATION_ADDED: 'COMMUNICATION_ADDED',
  USER_ONLINE: 'USER_ONLINE',
  USER_OFFLINE: 'USER_OFFLINE',
  MESSAGE_SENT: 'MESSAGE_SENT',
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
} as const;

// Helper functions for publishing events
export const publishCustomerUpdate = (customer: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.CUSTOMER_UPDATED, { 
    customerUpdated: customer 
  });
};

export const publishLeadUpdate = (lead: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.LEAD_UPDATED, { 
    leadUpdated: lead 
  });
};

export const publishProjectUpdate = (project: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.PROJECT_UPDATED, { 
    projectUpdated: project 
  });
};

export const publishNewActivity = (activity: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.NEW_ACTIVITY, { 
    newActivity: activity 
  });
};

export const publishDashboardUpdate = (data: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.DASHBOARD_UPDATED, { 
    dashboardUpdated: data 
  });
};

export const publishCommunicationAdded = (communication: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.COMMUNICATION_ADDED, { 
    communicationAdded: communication 
  });
};

export const publishUserOnline = (user: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.USER_ONLINE, { 
    userOnline: user 
  });
};

export const publishUserOffline = (user: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.USER_OFFLINE, { 
    userOffline: user 
  });
};

export const publishMessageSent = (message: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.MESSAGE_SENT, { 
    messageSent: message 
  });
};

export const publishNotification = (notification: any) => {
  pubsub.publish(SUBSCRIPTION_EVENTS.NOTIFICATION_CREATED, { 
    notificationCreated: notification 
  });
};
