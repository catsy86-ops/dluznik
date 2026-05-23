import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { userRepository } from '../repositories/UserRepository';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Authentication Controller
 * Handles auth-related HTTP requests
 * 
 * Requirements: 2.4
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   * 
   * @param req - Express request with email and password in body
   * @param res - Express response
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Email, hasło i potwierdzenie hasła są wymagane'
      );
    }

    // Validate email format
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new ApiError(
        400,
        'INVALID_EMAIL',
        'Nieprawidłowy format adresu email'
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      throw new ApiError(
        400,
        'PASSWORD_MISMATCH',
        'Hasła nie są identyczne'
      );
    }

    // Validate password length
    if (password.length < 8) {
      throw new ApiError(
        400,
        'PASSWORD_TOO_SHORT',
        'Hasło musi mieć co najmniej 8 znaków'
      );
    }

    // Register user
    const user = await authService.register(email, password);

    res.status(201).json(
      ApiResponse.success(
        201,
        'Użytkownik zarejestrowany pomyślnie',
        user
      )
    );
  });

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   * 
   * @param req - Express request with email and password in body
   * @param res - Express response
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(
        400,
        'MISSING_FIELDS',
        'Email i hasło są wymagane'
      );
    }

    // Login user
    const { user, token } = await authService.login(email, password);

    res.status(200).json(
      ApiResponse.success(
        200,
        'Zalogowano pomyślnie',
        {
          user,
          token,
        }
      )
    );
  });

  /**
   * POST /api/auth/logout
   * Logout user
   * 
   * @param req - Authenticated Express request
   * @param res - Express response
   */
  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Verify user is authenticated
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Użytkownik nie jest zalogowany'
      );
    }

    // Logout user
    const result = await authService.logout();

    res.status(200).json(
      ApiResponse.success(
        200,
        result.message,
        null
      )
    );
  });

  /**
   * GET /api/auth/me
   * Get current user information
   * 
   * @param req - Authenticated Express request
   * @param res - Express response
   */
  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const user = await userRepository.findById(req.user.id);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Użytkownik nie znaleziony');
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(200).json(ApiResponse.success(200, 'Dane użytkownika pobrane pomyślnie', userWithoutPassword));
  });

  /**
   * PATCH /api/auth/me
   * Update profile (notificationsEnabled, password change)
   */
  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Użytkownik nie jest zalogowany');
    const { notificationsEnabled, currentPassword, newPassword } = req.body;
    const user = await userRepository.findById(req.user.id);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Użytkownik nie znaleziony');

    const updates: Record<string, any> = {};
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

    if (newPassword) {
      if (!currentPassword) throw new ApiError(400, 'MISSING_FIELDS', 'Aktualne hasło jest wymagane');
      const bcrypt = await import('bcrypt');
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) throw new ApiError(400, 'INVALID_PASSWORD', 'Aktualne hasło jest nieprawidłowe');
      if (newPassword.length < 8) throw new ApiError(400, 'PASSWORD_TOO_SHORT', 'Nowe hasło musi mieć co najmniej 8 znaków');
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await userRepository.update(req.user.id, updates);
    const { passwordHash: _, ...userWithoutPassword } = updated;
    res.status(200).json(ApiResponse.success(200, 'Profil zaktualizowany pomyślnie', userWithoutPassword));
  });
}

// Export singleton instance
export const authController = new AuthController();
