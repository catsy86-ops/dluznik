import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError, asyncHandler } from './errorHandler';

/**
 * Extended Express Request with user information
 * Allows storing decoded JWT payload in request object
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    iat: number;
    exp: number;
  };
  sessionStartTime?: number;
}

/**
 * JWT Verification Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * 
 * Requirements: 1.4, 1.5, 14.3, 14.4
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(
          401,
          'MISSING_TOKEN',
          'Token jest wymagany. Zaloguj się ponownie.'
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      ) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };

      // Attach user info to request
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(
          401,
          'TOKEN_EXPIRED',
          'Sesja wygasła, zaloguj się ponownie'
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(
          401,
          'INVALID_TOKEN',
          'Token jest nieprawidłowy'
        );
      }

      throw error;
    }
  }
);

/**
 * Session Timeout Middleware
 * Checks if user session has exceeded 30 minutes of inactivity
 * Automatically logs out user if timeout is exceeded
 * 
 * Requirements: 1.4, 1.5, 14.3, 14.4
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const sessionTimeoutMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  // Session timeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Get session start time from request (set by login endpoint)
  // If not set, use current time as baseline
  if (!req.sessionStartTime) {
    req.sessionStartTime = Date.now();
  }

  const currentTime = Date.now();
  const sessionDuration = currentTime - req.sessionStartTime;

  // Check if session has exceeded timeout
  if (sessionDuration > SESSION_TIMEOUT) {
    // Clear session data
    req.user = undefined;
    req.sessionStartTime = undefined;

    throw new ApiError(
      401,
      'SESSION_TIMEOUT',
      'Sesja wygasła z powodu braku aktywności. Zaloguj się ponownie.'
    );
  }

  // Update session start time to current time (reset inactivity timer)
  req.sessionStartTime = currentTime;

  next();
};

/**
 * Automatic Logout Middleware
 * Handles automatic logout when session expires or user is inactive
 * Clears authentication tokens and session data
 * 
 * Requirements: 1.4, 1.5, 14.3, 14.4
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const autoLogoutMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    return next();
  }

  // Get token expiration time from JWT payload
  const tokenExpTime = req.user.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  // Check if token has expired
  if (currentTime > tokenExpTime) {
    // Clear user data
    req.user = undefined;
    req.sessionStartTime = undefined;

    // Return error response
    res.status(401).json({
      success: false,
      statusCode: 401,
      errorCode: 'TOKEN_EXPIRED',
      message: 'Sesja wygasła, zaloguj się ponownie',
      data: null,
    });
    return;
  }

  next();
};

/**
 * Combined Authentication Middleware
 * Applies JWT verification, session timeout, and auto logout checks
 * Use this middleware on protected routes
 * 
 * Requirements: 1.4, 1.5, 14.3, 14.4
 */
export const authenticate = [
  verifyJWT,
  sessionTimeoutMiddleware,
  autoLogoutMiddleware,
];
