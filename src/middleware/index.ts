/**
 * Middleware exports
 * Central export point for all middleware functions
 */

export { errorHandler, ApiError, asyncHandler } from './errorHandler';
export { requestLogger, detailedRequestLogger } from './requestLogger';
export { corsMiddleware, getCorsOptions, preflightHandler } from './corsConfig';
export {
  verifyJWT,
  sessionTimeoutMiddleware,
  autoLogoutMiddleware,
  authenticate,
  AuthenticatedRequest,
} from './authMiddleware';
export { requireEmailVerified } from './emailVerificationMiddleware';
