import { AppDataSource } from '../config/database-init';
import { User } from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * User Repository
 * Handles all database operations for User entity
 */
export class UserRepository {
  private repository = AppDataSource.getRepository(User);

  /**
   * Create a new user
   * @param email - User email address
   * @param passwordHash - Hashed password
   * @returns Created user
   * @throws Error if email format is invalid or email already exists
   */
  async create(email: string, passwordHash: string): Promise<User> {
    // Validate email format
    if (!isValidEmailFormat(email)) {
      throw new Error('Nieprawidłowy format adresu email');
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email już istnieje');
    }

    // Create new user
    const user = new User();
    user.id = uuidv4();
    user.email = email;
    user.passwordHash = passwordHash;
    user.notificationsEnabled = true;

    return this.repository.save(user);
  }

  /**
   * Find user by email
   * @param email - User email address
   * @returns User if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Update user
   * @param id - User ID
   * @param updates - Partial user data to update
   * @returns Updated user
   * @throws Error if user not found
   */
  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    // If email is being updated, validate it
    if (updates.email && updates.email !== user.email) {
      if (!isValidEmailFormat(updates.email)) {
        throw new Error('Nieprawidłowy format adresu email');
      }

      // Check if new email already exists
      const existingUser = await this.findByEmail(updates.email);
      if (existingUser) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'Email już istnieje');
      }
    }

    // Update user fields
    Object.assign(user, updates);
    return this.repository.save(user);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
