/**
 * Shared Backend Library
 * Exports all backend services, controllers, middleware, and utilities
 */

// Controllers
export * from './controllers/authController';
export * from './controllers/userController';
export * from './controllers/userManagementController';
export * from './controllers/invitationController';
export * from './controllers/enhancedInvitationController';
export * from './controllers/customerController';
export * from './controllers/crmController';
export * from './controllers/dashboardController';
export * from './controllers/communicationController';

// Routes
export * from './routes/authRoutes';
export * from './routes/userRoutes';
export * from './routes/invitationRoutes';
export * from './routes/crmRoutes';
export * from './routes/communicationRoutes';

// Middleware
export * from './middleware/auth';
export * from './middleware/cors';
export * from './middleware/errorHandler';
export * from './middleware/logging';
export * from './middleware/rateLimiting';
export * from './middleware/roleBasedAccess';
export * from './middleware/sessionManager';
export * from './middleware/validation';

// Services
export * from './services/emailService';
export * from './services/mfaService';
