import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Custom error class for API errors
 * Extends Error with HTTP status code and error code
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 * 
 * @param error - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  // Handle ApiError instances
  if (error instanceof ApiError) {
    const response = ApiResponse.error(
      error.statusCode,
      error.errorCode,
      error.message,
      error.details
    );
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle validation errors (from express-validator or similar)
  if (error.name === 'ValidationError') {
    const response = ApiResponse.error(
      400,
      'VALIDATION_ERROR',
      'Validation failed',
      { details: error.message }
    );
    res.status(400).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    const response = ApiResponse.error(
      400,
      'INVALID_JSON',
      'Invalid JSON in request body'
    );
    res.status(400).json(response);
    return;
  }

  // Handle generic errors - always return JSON with message
  const statusCode = 500;
  const errorCode = 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message;

  const response = ApiResponse.error(statusCode, errorCode, message);
  res.status(statusCode).json(response);

  // Also log to console
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    duration: Date.now(),
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: (req as any).user?.id || 'anonymous',
  });
};

/**
 * Async error wrapper for route handlers
 * Catches errors in async functions and passes them to error handler
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
