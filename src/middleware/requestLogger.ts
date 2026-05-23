import { Request, Response, NextFunction } from 'express';

/**
 * Interface for request log data
 */
interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, status code, and response time
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Record start time
  const startTime = Date.now();

  // Store original send function
  const originalSend = res.send;

  // Override send function to capture response
  res.send = function (data: any) {
    // Calculate duration
    const duration = Date.now() - startTime;

    // Extract user ID from request if available (from JWT token)
    const userId = (req as any).userId || 'anonymous';

    // Create log object
    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket.remoteAddress,
      userId,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      console.error('[ERROR]', log);
    } else if (res.statusCode >= 400) {
      console.warn('[WARN]', log);
    } else {
      console.log('[INFO]', log);
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Detailed request logging middleware
 * Logs request headers, body, and query parameters (useful for debugging)
 * Should only be used in development environment
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const detailedRequestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[REQUEST]', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      },
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    });
  }

  next();
};
