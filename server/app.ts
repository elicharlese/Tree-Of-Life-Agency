import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import leadRoutes from './routes/leads';
import orderRoutes from './routes/orders';
import orderProcessingRoutes from './routes/orderProcessing';
import projectRoutes from './routes/projects';
import activityRoutes from './routes/activities';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import invitationRoutes from './routes/invitations';
import paymentRoutes from './routes/payments';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { generalLimiter, authLimiter, paymentLimiter } from './middleware/rateLimiter';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://treeoflifeagency.com', 'https://www.treeoflifeagency.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : 'Database connection failed'
    });
  }
});

// Apply rate limiting
app.use('/api/v1', generalLimiter);

// API Routes with specific rate limiting
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/order-processing', orderProcessingRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/payments', paymentLimiter, paymentRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export default app;
