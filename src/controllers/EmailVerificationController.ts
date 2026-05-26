import { Request, Response } from 'express';
import { emailVerificationService } from '../services/EmailVerificationService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Email Verification Controller
 * Handles email verification HTTP requests: verify token and resend verification.
 *
 * Requirements: 2.1, 2.3, 2.4, 2.7, 2.8
 */
export class EmailVerificationController {
  /**
   * POST /api/auth/verify-email
   * Verify email using a token from the verification link.
   *
   * Body: { token: string }
   * Response: { message: string }
   *
   * Requirements: 2.3, 2.5, 2.8
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // Validate token is provided
    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'INVALID_TOKEN', 'Link jest nieprawidłowy');
    }

    // Verify the token via service (handles format validation, expiry, used checks)
    const result = await emailVerificationService.verifyToken(token);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Email zweryfikowany pomyślnie',
        { userId: result.userId }
      )
    );
  });

  /**
   * POST /api/auth/resend-verification
   * Resend verification email to the authenticated user.
   * Rate limited: max 5 per hour, min 60s between requests.
   *
   * Headers: { Authorization: 'Bearer <token>' }
   * Response: { message: string }
   *
   * Requirements: 2.6, 2.9
   */
  resendVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    }

    // Resend verification (service handles rate limiting internally)
    await emailVerificationService.resendVerification(req.user.id);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Email weryfikacyjny został wysłany ponownie',
        null
      )
    );
  });
}

// Export singleton instance
export const emailVerificationController = new EmailVerificationController();
