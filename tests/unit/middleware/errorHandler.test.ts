import { Request, Response, NextFunction } from 'express';
import { errorHandler, ApiError, asyncHandler } from '../../../src/middleware/errorHandler';

describe('ApiError', () => {
  it('should create an ApiError with all properties', () => {
    const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input', { field: 'email' });

    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid input');
    expect(error.details).toEqual({ field: 'email' });
    expect(error.name).toBe('ApiError');
  });

  it('should be instanceof Error', () => {
    const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });
});

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/api/test',
      method: 'GET',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle ApiError correctly', () => {
    const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input', { field: 'email' });

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.error.code).toBe('BAD_REQUEST');
  });

  it('should handle ValidationError', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle JSON parsing errors', () => {
    const error = new SyntaxError('Unexpected token');
    (error as any).body = '{"invalid json}';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.error.code).toBe('INVALID_JSON');
  });

  it('should handle generic errors with 500 status', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalled();

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.statusCode).toBe(500);
    expect(response.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should hide error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Database connection failed');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.message).toBe('An unexpected error occurred');

    process.env.NODE_ENV = originalEnv;
  });

  it('should show error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Database connection failed');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    const response = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(response.message).toBe('Database connection failed');

    process.env.NODE_ENV = originalEnv;
  });

  it('should log errors', () => {
    const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(console.error).toHaveBeenCalled();
  });
});

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should execute async function successfully', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(asyncFn);

    wrapped(mockReq as Request, mockRes as Response, mockNext);

    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch errors from async function', async () => {
    const error = new Error('Async error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(asyncFn);

    wrapped(mockReq as Request, mockRes as Response, mockNext);

    // Wait for promise to reject
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should pass through errors to next middleware', async () => {
    const error = new Error('Handler error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(asyncFn);

    wrapped(mockReq as Request, mockRes as Response, mockNext);

    // Wait for promise to reject
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
