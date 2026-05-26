import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../src/middleware/authMiddleware';
import { requireEmailVerified } from '../../../src/middleware/emailVerificationMiddleware';
import { userRepository } from '../../../src/repositories/UserRepository';

// Mock the UserRepository
jest.mock('../../../src/repositories/UserRepository', () => ({
  userRepository: {
    findById: jest.fn(),
  },
}));

describe('requireEmailVerified middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user-123', email: 'test@example.com', iat: 0, exp: 0 },
      path: '/api/loans',
      originalUrl: '/api/loans',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() for verified users', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
    });

    await requireEmailVerified(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should return 403 EMAIL_NOT_VERIFIED for unverified users', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: false,
    });

    await requireEmailVerified(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.errorCode).toBe('EMAIL_NOT_VERIFIED');
    expect(error.message).toBe('Zweryfikuj email');
  });

  it('should skip check for /api/auth/verify-email route', async () => {
    const req = {
      ...mockReq,
      path: '/api/auth/verify-email',
      originalUrl: '/api/auth/verify-email',
    } as unknown as AuthenticatedRequest;

    await requireEmailVerified(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip check for /api/auth/resend-verification route', async () => {
    const req = {
      ...mockReq,
      path: '/api/auth/resend-verification',
      originalUrl: '/api/auth/resend-verification',
    } as unknown as AuthenticatedRequest;

    await requireEmailVerified(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip check for /api/auth/logout route', async () => {
    const req = {
      ...mockReq,
      path: '/api/auth/logout',
      originalUrl: '/api/auth/logout',
    } as unknown as AuthenticatedRequest;

    await requireEmailVerified(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip check for /api/auth/me route', async () => {
    const req = {
      ...mockReq,
      path: '/api/auth/me',
      originalUrl: '/api/auth/me',
    } as unknown as AuthenticatedRequest;

    await requireEmailVerified(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip check when no user is attached (unauthenticated)', async () => {
    mockReq.user = undefined;

    await requireEmailVerified(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not found in database', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await requireEmailVerified(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe('USER_NOT_FOUND');
  });

  it('should pass database errors to next()', async () => {
    const dbError = new Error('Database connection failed');
    (userRepository.findById as jest.Mock).mockRejectedValue(dbError);

    await requireEmailVerified(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});
