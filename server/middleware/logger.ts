import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for user ID
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Custom token for user role
morgan.token('user-role', (req: Request) => {
  return (req as any).user?.role || 'none';
});

// Custom format for API logging
const apiLogFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user-role :response-time ms';

// Development logger
export const developmentLogger = morgan('dev');

// Production logger with custom format
export const productionLogger = morgan(apiLogFormat, {
  skip: (req: Request, res: Response) => {
    // Skip health check requests in production logs
    return req.url === '/api/health';
  }
});

// Security logger for authentication events
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log authentication events
    if (req.url.includes('/auth/') || req.url.includes('/invitation/')) {
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        userId: (req as any).user?.id || null,
        userRole: (req as any).user?.role || null
      };
      
      console.log('SECURITY_LOG:', JSON.stringify(logData));
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (>1000ms)
    if (duration > 1000) {
      console.warn('SLOW_REQUEST:', {
        requestId: (req as any).requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: (req as any).user?.id || null
      });
    }
  });
  
  next();
};
