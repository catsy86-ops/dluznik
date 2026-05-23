import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Authentication Routes
 * Handles user registration, login, logout, and profile endpoints
 * 
 * Requirements: 2.4
 */
const authRoutes = Router();

/**
 * POST /api/auth/register
 * Register a new user
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
 * GET /api/auth/me
 * Get current user information (requires authentication)
 * Headers: { Authorization: 'Bearer <token>' }
 * Response: { user: User }
 */
authRoutes.get('/me', authenticate, authController.getCurrentUser);
authRoutes.patch('/me', authenticate, authController.updateProfile);

export default authRoutes;
