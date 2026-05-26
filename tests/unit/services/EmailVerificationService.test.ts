import { EmailVerificationService } from '../../../src/services/EmailVerificationService';
import { EmailVerificationToken } from '../../../src/models/EmailVerificationToken';
import { ResendRateLimit } from '../../../src/models/ResendRateLimit';
import { User } from '../../../src/models/User';

/**
 * Unit Tests for EmailVerificationService
 * Tests token generation, verification, resend, and rate limiting
 *
 * Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9
 */

// Mock the database-init module to provide mock repositories
jest.mock('../../../src/config/database-init', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import { AppDataSource } from '../../../src/config/database-init';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let mockTokenRepo: any;
  let mockRateLimitRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTokenRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    };

    mockRateLimitRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity === EmailVerificationToken) return mockTokenRepo;
      if (entity === ResendRateLimit) return mockRateLimitRepo;
      if (entity === User) return mockUserRepo;
      return {};
    });

    service = new EmailVerificationService();
  });

  describe('sendVerificationEmail', () => {
    it('should create a token and save it to the database', async () => {
      mockTokenRepo.save.mockResolvedValue({});

      await service.sendVerificationEmail('user-123', 'test@example.com');

      expect(mockTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          token: expect.stringMatching(/^[a-f0-9]{64}$/),
          usedAt: null,
        })
      );
    });

    it('should set token expiry to 24 hours from now', async () => {
      mockTokenRepo.save.mockResolvedValue({});
      const before = Date.now();

      await service.sendVerificationEmail('user-123', 'test@example.com');

      const after = Date.now();
      const savedToken = mockTokenRepo.save.mock.calls[0][0];
      const expiresAt = savedToken.expiresAt.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + twentyFourHours);
      expect(expiresAt).toBeLessThanOrEqual(after + twentyFourHours);
    });

    it('should invalidate previous tokens before creating a new one', async () => {
      mockTokenRepo.save.mockResolvedValue({});

      await service.sendVerificationEmail('user-123', 'test@example.com');

      const queryBuilder = mockTokenRepo.createQueryBuilder();
      expect(queryBuilder.update).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith('userId = :userId', { userId: 'user-123' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('usedAt IS NULL');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and mark user as verified', async () => {
      const validToken = 'a'.repeat(64);
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerifiedAt: null,
      };

      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-id',
        userId: 'user-123',
        token: validToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        usedAt: null,
        createdAt: new Date(),
      });
      mockTokenRepo.save.mockResolvedValue({});
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({});

      const result = await service.verifyToken(validToken);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: true,
          emailVerifiedAt: expect.any(Date),
        })
      );
    });

    it('should reject a malformed token', async () => {
      await expect(service.verifyToken('not-a-valid-hex')).rejects.toThrow(
        'Link jest nieprawidłowy'
      );
    });

    it('should reject a token that does not exist in the database', async () => {
      const validFormatToken = 'b'.repeat(64);
      mockTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.verifyToken(validFormatToken)).rejects.toThrow(
        'Link jest nieprawidłowy'
      );
    });

    it('should reject an already-used token', async () => {
      const validToken = 'c'.repeat(64);
      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-id',
        userId: 'user-123',
        token: validToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        usedAt: new Date(), // already used
        createdAt: new Date(),
      });

      await expect(service.verifyToken(validToken)).rejects.toThrow(
        'Link jest nieprawidłowy'
      );
    });

    it('should reject an expired token', async () => {
      const validToken = 'd'.repeat(64);
      mockTokenRepo.findOne.mockResolvedValue({
        id: 'token-id',
        userId: 'user-123',
        token: validToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago (expired)
        usedAt: null,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      });

      await expect(service.verifyToken(validToken)).rejects.toThrow('Link wygasł');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow request when no previous requests exist', async () => {
      mockRateLimitRepo.find.mockResolvedValue([]);

      const result = await service.checkRateLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.nextAllowedAt).toBeNull();
    });

    it('should deny request when 5 requests made in the last hour', async () => {
      const now = Date.now();
      const recentRequests = Array.from({ length: 5 }, (_, i) => ({
        id: `req-${i}`,
        userId: 'user-123',
        requestedAt: new Date(now - (i + 1) * 5 * 60 * 1000), // spaced 5 min apart
      }));

      mockRateLimitRepo.find.mockResolvedValue(recentRequests);

      const result = await service.checkRateLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.nextAllowedAt).toBeInstanceOf(Date);
    });

    it('should deny request when last request was less than 60 seconds ago', async () => {
      const now = Date.now();
      mockRateLimitRepo.find.mockResolvedValue([
        {
          id: 'req-1',
          userId: 'user-123',
          requestedAt: new Date(now - 30 * 1000), // 30 seconds ago
        },
      ]);

      const result = await service.checkRateLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.nextAllowedAt).toBeInstanceOf(Date);
      // nextAllowedAt should be ~30 seconds from now
      expect(result.nextAllowedAt!.getTime()).toBeGreaterThan(now);
    });

    it('should allow request when last request was more than 60 seconds ago', async () => {
      const now = Date.now();
      mockRateLimitRepo.find.mockResolvedValue([
        {
          id: 'req-1',
          userId: 'user-123',
          requestedAt: new Date(now - 90 * 1000), // 90 seconds ago
        },
      ]);

      const result = await service.checkRateLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.nextAllowedAt).toBeNull();
    });
  });

  describe('resendVerification', () => {
    it('should send a new verification email when rate limit allows', async () => {
      mockRateLimitRepo.find.mockResolvedValue([]);
      mockRateLimitRepo.save.mockResolvedValue({});
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });
      mockTokenRepo.save.mockResolvedValue({});

      await service.resendVerification('user-123');

      // Should save rate limit entry
      expect(mockRateLimitRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          requestedAt: expect.any(Date),
        })
      );
      // Should save new token
      expect(mockTokenRepo.save).toHaveBeenCalled();
    });

    it('should throw 429 when rate limited', async () => {
      const now = Date.now();
      const recentRequests = Array.from({ length: 5 }, (_, i) => ({
        id: `req-${i}`,
        userId: 'user-123',
        requestedAt: new Date(now - (i + 1) * 5 * 60 * 1000),
      }));
      mockRateLimitRepo.find.mockResolvedValue(recentRequests);

      await expect(service.resendVerification('user-123')).rejects.toMatchObject({
        statusCode: 429,
        errorCode: 'RATE_LIMITED',
      });
    });

    it('should throw 404 when user not found', async () => {
      mockRateLimitRepo.find.mockResolvedValue([]);
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.resendVerification('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });
  });

  describe('isValidTokenFormat', () => {
    it('should accept a valid 64-char hex string', () => {
      const validToken = 'abcdef0123456789'.repeat(4); // 64 chars
      expect(service.isValidTokenFormat(validToken)).toBe(true);
    });

    it('should reject a token that is too short', () => {
      expect(service.isValidTokenFormat('abc123')).toBe(false);
    });

    it('should reject a token that is too long', () => {
      expect(service.isValidTokenFormat('a'.repeat(65))).toBe(false);
    });

    it('should reject a token with non-hex characters', () => {
      expect(service.isValidTokenFormat('g'.repeat(64))).toBe(false);
    });

    it('should reject an empty string', () => {
      expect(service.isValidTokenFormat('')).toBe(false);
    });

    it('should reject uppercase hex characters', () => {
      expect(service.isValidTokenFormat('A'.repeat(64))).toBe(false);
    });
  });
});
