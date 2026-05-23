import { getCorsOptions, corsMiddleware, preflightHandler } from '../../../src/middleware/corsConfig';

describe('getCorsOptions', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    delete process.env.CORS_ORIGIN;
  });

  it('should return CORS options object', () => {
    const options = getCorsOptions();

    expect(options).toBeDefined();
    expect(options.methods).toBeDefined();
    expect(options.allowedHeaders).toBeDefined();
    expect(options.credentials).toBe(true);
  });

  it('should include required HTTP methods', () => {
    const options = getCorsOptions();

    expect(options.methods).toContain('GET');
    expect(options.methods).toContain('POST');
    expect(options.methods).toContain('PUT');
    expect(options.methods).toContain('DELETE');
    expect(options.methods).toContain('PATCH');
    expect(options.methods).toContain('OPTIONS');
  });

  it('should include required headers', () => {
    const options = getCorsOptions();

    expect(options.allowedHeaders).toContain('Content-Type');
    expect(options.allowedHeaders).toContain('Authorization');
    expect(options.allowedHeaders).toContain('X-Requested-With');
  });

  it('should expose required headers', () => {
    const options = getCorsOptions();

    expect(options.exposedHeaders).toContain('Content-Type');
    expect(options.exposedHeaders).toContain('X-Total-Count');
  });

  it('should allow credentials', () => {
    const options = getCorsOptions();

    expect(options.credentials).toBe(true);
  });

  it('should set maxAge to 24 hours', () => {
    const options = getCorsOptions();

    expect(options.maxAge).toBe(86400);
  });

  describe('origin handling', () => {
    it('should allow requests with no origin', (done) => {
      const options = getCorsOptions();
      const originFn = options.origin as Function;

      originFn(undefined, (err: any, allowed: boolean) => {
        expect(err).toBeNull();
        expect(allowed).toBe(true);
        done();
      });
    });

    it('should allow all origins in development', (done) => {
      process.env.NODE_ENV = 'development';
      const options = getCorsOptions();
      const originFn = options.origin as Function;

      originFn('http://example.com', (err: any, allowed: boolean) => {
        expect(err).toBeNull();
        expect(allowed).toBe(true);
        done();
      });
    });

    it('should allow whitelisted origins in production', (done) => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'http://localhost:3000,https://example.com';

      const options = getCorsOptions();
      const originFn = options.origin as Function;

      originFn('http://localhost:3000', (err: any, allowed: boolean) => {
        expect(err).toBeNull();
        expect(allowed).toBe(true);
        done();
      });
    });

    it('should reject non-whitelisted origins in production', (done) => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const options = getCorsOptions();
      const originFn = options.origin as Function;

      originFn('http://malicious.com', (err: any) => {
        expect(err).toBeDefined();
        expect(err.message).toBe('Not allowed by CORS');
        done();
      });
    });

    it('should handle multiple origins from environment variable', (done) => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'http://localhost:3000, http://localhost:3001 , https://example.com';

      const options = getCorsOptions();
      const originFn = options.origin as Function;

      originFn('http://localhost:3001', (err: any, allowed: boolean) => {
        expect(err).toBeNull();
        expect(allowed).toBe(true);
        done();
      });
    });
  });
});

describe('corsMiddleware', () => {
  it('should return a middleware function', () => {
    const middleware = corsMiddleware();

    expect(typeof middleware).toBe('function');
  });
});

describe('preflightHandler', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      headers: {
        origin: 'http://localhost:3000',
      },
    };

    mockRes = {
      header: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
  });

  it('should set Access-Control-Allow-Origin header', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://localhost:3000'
    );
  });

  it('should set Access-Control-Allow-Methods header', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
  });

  it('should set Access-Control-Allow-Headers header', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
  });

  it('should set Access-Control-Allow-Credentials header', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true'
    );
  });

  it('should set Access-Control-Max-Age header', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Max-Age',
      '86400'
    );
  });

  it('should send 200 status', () => {
    preflightHandler(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should use wildcard origin if no origin header', () => {
    mockReq.headers.origin = undefined;

    preflightHandler(mockReq, mockRes);

    expect(mockRes.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });
});
