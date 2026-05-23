import cors, { CorsOptions } from 'cors';

/**
 * CORS configuration for different environments
 * Defines allowed origins, methods, headers, and credentials
 */

/**
 * Get CORS options based on environment
 * In production, only allow specific origins
 * In development, allow all origins for easier testing
 * 
 * @returns CORS options object
 */
export const getCorsOptions = (): CorsOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Parse allowed origins from environment variable
  // Format: "http://localhost:3000,http://localhost:3001,https://example.com"
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

  const corsOptions: CorsOptions = {
    // Allow requests from specified origins
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // In development, allow all origins
      if (nodeEnv === 'development') {
        return callback(null, true);
      }

      // In production, check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Reject if origin not allowed
      return callback(new Error('Not allowed by CORS'));
    },

    // Allow these HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Allow these headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],

    // Expose these headers to the client
    exposedHeaders: [
      'Content-Type',
      'X-Total-Count',
      'X-Page-Number',
      'X-Page-Size',
    ],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Cache preflight requests for 24 hours
    maxAge: 86400,
  };

  return corsOptions;
};

/**
 * CORS middleware factory
 * Creates and returns configured CORS middleware
 * 
 * @returns Configured CORS middleware
 */
export const corsMiddleware = () => {
  return cors(getCorsOptions());
};

/**
 * Preflight request handler
 * Handles OPTIONS requests for CORS preflight
 * 
 * @returns Express middleware function
 */
export const preflightHandler = (req: any, res: any) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
};
