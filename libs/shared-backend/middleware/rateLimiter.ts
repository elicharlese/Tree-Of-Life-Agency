import rateLimit from 'express-rate-limit';

// Disable rate limiting in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnvironment ? 0 : 100, // disable in test, limit to 100 in production
  skip: () => isTestEnvironment,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnvironment ? 0 : 5, // disable in test, limit to 5 in production
  skip: () => isTestEnvironment,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoints rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnvironment ? 0 : 10, // disable in test, limit to 10 in production
  skip: () => isTestEnvironment,
  message: {
    error: 'Too many payment requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTestEnvironment ? 0 : 20, // disable in test, limit to 20 in production
  skip: () => isTestEnvironment,
  message: {
    error: 'Too many upload requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Alias for consistency with route imports
export const rateLimitAuth = authLimiter;
export const rateLimitGeneral = generalLimiter;
