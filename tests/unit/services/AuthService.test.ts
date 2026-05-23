import { AuthService } from '../../../src/services/AuthService';
import { UserRepository } from '../../../src/repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Unit Tests for AuthService
 * Tests registration, login, and password hashing functionality
 * 
 * Requirements: 2.3
 */

// Mock the UserRepository
jest.mock('../../../src/repositories/UserRepository');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of AuthService for each test
    authService = new AuthService();
    
    // Get the mocked repository
    mockUserRepository = require('../../../src/repositories/UserRepository').userRepository as jest.Mocked<UserRepository>;
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123';
      const userId = 'user-123';
      
      const mockUser = {
        id: userId,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(email, password);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.id).toBe(userId);
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        email,
        expect.any(String) // hashed password
      );
    });

    it('should reject registration with duplicate email', async () => {
      // Arrange
      const email = 'existing@example.com';
      const password = 'ValidPassword123';

      mockUserRepository.create.mockRejectedValue(
        new Error('Email już istnieje')
      );

      // Act & Assert
      await expect(authService.register(email, password)).rejects.toThrow(
        'Email już istnieje'
      );
    });

    it('should reject registration with password shorter than 8 characters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'Short1';

      // Act & Assert
      await expect(authService.register(email, password)).rejects.toThrow(
        'Hasło musi mieć co najmniej 8 znaków'
      );
    });

    it('should hash password with bcrypt', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123';
      const userId = 'user-123';
      
      const mockUser = {
        id: userId,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      await authService.register(email, password);

      // Assert
      const callArgs = mockUserRepository.create.mock.calls[0];
      const hashedPassword = callArgs[1];
      
      // Verify the hashed password is different from the plain password
      expect(hashedPassword).not.toBe(password);
      
      // Verify the hashed password can be compared with bcrypt
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123';
      const userId = 'user-123';
      const passwordHash = await bcrypt.hash(password, 10);

      const mockUser = {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        lastLoginAt: new Date(),
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
        })
      );
    });

    it('should reject login with non-existent email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'ValidPassword123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Nieprawidłowy email lub hasło'
      );
    });

    it('should reject login with incorrect password', async () => {
      // Arrange
      const email = 'test@example.com';
      const correctPassword = 'ValidPassword123';
      const incorrectPassword = 'WrongPassword123';
      const userId = 'user-123';
      const passwordHash = await bcrypt.hash(correctPassword, 10);

      const mockUser = {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(email, incorrectPassword)).rejects.toThrow(
        'Nieprawidłowy email lub hasło'
      );
    });

    it('should return valid JWT token on successful login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123';
      const userId = 'user-123';
      const passwordHash = await bcrypt.hash(password, 10);

      const mockUser = {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        lastLoginAt: new Date(),
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result.token).toBeDefined();
      
      // Verify token can be decoded
      const decoded = jwt.decode(result.token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.email).toBe(email);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123';
      const userId = 'user-123';
      const passwordHash = await bcrypt.hash(password, 10);

      const mockUser = {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        notificationsEnabled: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        lastLoginAt: new Date(),
      });

      // Get a valid token
      const { token } = await authService.login(email, password);

      // Act
      const decoded = authService.validateToken(token);

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
      expect(decoded.email).toBe(email);
    });

    it('should reject an invalid JWT token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => authService.validateToken(invalidToken)).toThrow();
    });
  });

  describe('logout', () => {
    it('should return success message on logout', async () => {
      // Act
      const result = await authService.logout();

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('Wylogowano pomyślnie');
    });
  });
});
