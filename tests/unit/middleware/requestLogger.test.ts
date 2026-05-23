import { Request, Response, NextFunction } from 'express';
import { requestLogger, detailedRequestLogger } from '../../../src/middleware/requestLogger';

describe('requestLogger', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };

    mockRes = {
      statusCode: 200,
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log successful requests', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    // Call the overridden send function
    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { data: 'test' });

    expect(console.log).toHaveBeenCalled();
    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[0]).toBe('[INFO]');
    expect(logCall[1].method).toBe('GET');
    expect(logCall[1].path).toBe('/api/test');
    expect(logCall[1].statusCode).toBe(200);
  });

  it('should log client errors (4xx)', () => {
    mockRes.statusCode = 400;

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { error: 'Bad request' });

    expect(console.warn).toHaveBeenCalled();
    const logCall = (console.warn as jest.Mock).mock.calls[0];
    expect(logCall[0]).toBe('[WARN]');
    expect(logCall[1].statusCode).toBe(400);
  });

  it('should log server errors (5xx)', () => {
    mockRes.statusCode = 500;

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { error: 'Internal server error' });

    expect(console.error).toHaveBeenCalled();
    const logCall = (console.error as jest.Mock).mock.calls[0];
    expect(logCall[0]).toBe('[ERROR]');
    expect(logCall[1].statusCode).toBe(500);
  });

  it('should include request duration', (done) => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    // Simulate some delay
    setTimeout(() => {
      const sendFn = (mockRes as any).send;
      sendFn.call(mockRes, { data: 'test' });

      const logCall = (console.log as jest.Mock).mock.calls[0];
      expect(logCall[1].duration).toBeGreaterThanOrEqual(0);
      done();
    }, 10);
  });

  it('should include user agent', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { data: 'test' });

    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[1].userAgent).toBe('Mozilla/5.0');
  });

  it('should include IP address', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { data: 'test' });

    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[1].ip).toBe('127.0.0.1');
  });

  it('should include user ID if available', () => {
    (mockReq as any).userId = 'user-123';

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    sendFn.call(mockRes, { data: 'test' });

    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[1].userId).toBe('user-123');
  });

  it('should call next function', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should preserve original send functionality', () => {
    const originalSend = jest.fn().mockReturnThis();
    mockRes.send = originalSend;

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const sendFn = (mockRes as any).send;
    const testData = { data: 'test' };
    sendFn.call(mockRes, testData);

    expect(originalSend).toHaveBeenCalledWith(testData);
  });
});

describe('detailedRequestLogger', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      path: '/api/users',
      query: { filter: 'active' },
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
      },
      body: { email: 'test@example.com', password: 'secret' },
    };

    mockRes = {};
    mockNext = jest.fn();

    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log detailed request info in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    detailedRequestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(console.log).toHaveBeenCalled();
    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[0]).toBe('[REQUEST]');
    expect(logCall[1].method).toBe('POST');
    expect(logCall[1].path).toBe('/api/users');
    expect(logCall[1].query).toEqual({ filter: 'active' });
    expect(logCall[1].body).toEqual({ email: 'test@example.com', password: 'secret' });

    process.env.NODE_ENV = originalEnv;
  });

  it('should redact authorization header', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    detailedRequestLogger(mockReq as Request, mockRes as Response, mockNext);

    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[1].headers.authorization).toBe('[REDACTED]');

    process.env.NODE_ENV = originalEnv;
  });

  it('should not log in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    detailedRequestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(console.log).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should call next function', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    detailedRequestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle empty body', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    mockReq.body = {};

    detailedRequestLogger(mockReq as Request, mockRes as Response, mockNext);

    const logCall = (console.log as jest.Mock).mock.calls[0];
    expect(logCall[1].body).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});
