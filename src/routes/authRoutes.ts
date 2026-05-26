import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { emailVerificationController } from '../controllers/EmailVerificationController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Authentication Routes
 * Handles user registration, login, logout, profile, and email verification endpoints
 * 
 * Requirements: 2.1, 2.3, 2.4, 2.6, 2.7, 2.8
 */
const authRoutes = Router();

/**
 * POST /api/auth/register
 * Register a new user and trigger verification email
 * Body: { email: string, password: string, confirmPassword: string }
 * Response: { user: User }
 */
authRoutes.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 * Body: { email: string, password: string }
 * Response: { user: User, token: string }
 */
authRoutes.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 * Headers: { Authorization: 'Bearer <token>' }
 * Response: { message: string }
 */
authRoutes.post('/logout', authenticate, authController.logout);

/**
 * POST /api/auth/verify-email
 * Verify email address using token from verification link
 * Body: { token: string }
 * Response: { message: string, data: { userId: string } }
 *
 * Requirements: 2.3, 2.5, 2.8
 */
authRoutes.post('/verify-email', emailVerificationController.verifyEmail);

/**
 * POST /api/auth/resend-verification
 * Resend verification email (requires authentication, rate limited)
 * Headers: { Authorization: 'Bearer <token>' }
 * Response: { message: string }
 *
 * Requirements: 2.6, 2.9
 */
authRoutes.post('/resend-verification', authenticate, emailVerificationController.resendVerification);

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 * Headers: { Authorization: 'Bearer <token>' }
 * Response: { user: User }
 */
authRoutes.get('/me', authenticate, authController.getCurrentUser);
authRoutes.patch('/me', authenticate, authController.updateProfile);

export default authRoutes;
