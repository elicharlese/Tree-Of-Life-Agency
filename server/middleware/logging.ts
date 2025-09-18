import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  status?: number;
}

export function logRequest(request: NextRequest, response?: NextResponse): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    status: response?.status,
  };

  // In production, you'd want to send this to a logging service
  console.log(`[API] ${logEntry.method} ${logEntry.url} - Status: ${logEntry.status}`);
}

export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      
      logRequest(request, response);
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`[API ERROR] ${request.method} ${request.url} - Duration: ${duration}ms`, error);
      
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function logError(error: Error, context?: string): void {
  console.error(`[ERROR${context ? ` ${context}` : ''}]`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
}
