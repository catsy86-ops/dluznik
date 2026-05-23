import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { ApiError } from '../middleware/errorHandler';

/**
 * Authentication Service
 * Handles user registration, login, logout, and token validation
 * 
 * Requirements: 2.2
 */
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_EXPIRY = '24h';
  private readonly PASSWORD_MIN_LENGTH = 8;
  private readonly BCRYPT_ROUNDS = 10;

  /**
   * Register a new user
   * @param email - User email address
   * @param password - User password (plain text)
   * @returns Created user (without password hash)
   * @throws Error if email is invalid, already exists, or password is too short
   */
  async register(email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
    // Validate password length
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      throw new Error(`Hasło musi mieć co najmniej ${this.PASSWORD_MIN_LENGTH} znaków`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create user (UserRepository handles email validation and uniqueness)
    const user = await userRepository.create(email, passwordHash);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Login user
   * @param email - User email address
   * @param password - User password (plain text)
   * @returns Object containing user info and JWT token
   * @throws Error if user not found or password is incorrect
   */
  async login(email: string, password: string): Promise<{
    user: Omit<User, 'passwordHash'>;
    token: string;
  }> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Nieprawidłowy email lub hasło');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Nieprawidłowy email lub hasło');
    }

    // Update last login time
    await userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password hash and token
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Logout user
   * Note: In JWT-based authentication, logout is typically handled on the client side
   * by removing the token. This method can be used for server-side token blacklisting
   * if needed in the future.
   * 
   * @returns Success message
   */
  async logout(): Promise<{ message: string }> {
    // In a real application, you might want to:
    // 1. Add token to a blacklist
    // 2. Invalidate refresh tokens
    // 3. Clear session data
    
    // For now, just return success
    return { message: 'Wylogowano pomyślnie' };
  }

  /**
   * Validate JWT token
   * @param token - JWT token to validate
   * @returns Decoded token payload if valid
   * @throws Error if token is invalid or expired
   */
  validateToken(token: string): {
    id: string;
    email: string;
    iat: number;
    exp: number;
  } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token wygasł');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token jest nieprawidłowy');
      }
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   * @param user - User object
   * @returns JWT token
   */
  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      this.JWT_SECRET,
      {
        expiresIn: this.JWT_EXPIRY,
      }
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
