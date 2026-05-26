import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ApiError } from './errorHandler';
import { userRepository } from '../repositories/UserRepository';

/**
 * Routes that are excluded from email verification check.
 * These routes must remain accessible to unverified users.
 */
const EXCLUDED_PATHS = [
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/logout',
  '/api/auth/me',
];

/**
 * Email Verification Middleware
 * Checks that the authenticated user has verified their email address.
 * Returns 403 with EMAIL_NOT_VERIFIED error for unverified users.
 * Excludes verification-related routes so users can still verify, resend, logout, or check profile.
 *
 * Requirements: 2.2
 *
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @param next - Express next function
 */
export const requireEmailVerified = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip check for excluded paths
    if (EXCLUDED_PATHS.some((path) => req.path === path || req.originalUrl.endsWith(path))) {
      return next();
    }

    // If no user is attached (not authenticated), skip — let auth middleware handle it
    if (!req.user) {
      return next();
    }

    // Fetch user from database to get current emailVerified status
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      throw new ApiError(
        401,
        'USER_NOT_FOUND',
        'Użytkownik nie został znaleziony'
      );
    }

    if (!user.emailVerified) {
      throw new ApiError(
        403,
        'EMAIL_NOT_VERIFIED',
        'Zweryfikuj email'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
