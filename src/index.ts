import express, { Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabaseOnStartup } from './config/database-init';
import {
  corsMiddleware,
  requestLogger,
  detailedRequestLogger,
  errorHandler,
} from './middleware';
import { ApiResponse } from './utils/apiResponse';
import authRoutes from './routes/authRoutes';
import loanRoutes from './routes/loanRoutes';
import obligationRoutes from './routes/obligationRoutes';
import summaryRoutes from './routes/summaryRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Security Middleware
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction ? undefined : false,
}));

/**
 * CORS Middleware (only needed in dev - in prod frontend is served from same origin)
 */
if (!isProduction) {
  app.use(corsMiddleware());
}

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
app.use(detailedRequestLogger);
app.use(requestLogger);

/**
 * Health Check Endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json(
    ApiResponse.success(
      200,
      'Server is healthy',
      {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      }
    )
  );
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/obligations', obligationRoutes);
app.use('/api/summary', summaryRoutes);

/**
 * Serve React frontend in production
 * All non-API routes serve the React app
 */
if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      res.status(404).json(ApiResponse.notFound('Endpoint', req.path));
    } else {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
} else {
  /**
   * 404 Not Found Handler (dev only)
   */
  app.use((req: Request, res: Response) => {
    res.status(404).json(
      ApiResponse.notFound('Endpoint', req.path)
    );
  });
}

/**
 * Global Error Handler Middleware
 * Must be registered last
 */
app.use(errorHandler);

/**
 * Initialize Database and Start Server
 */
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabaseOnStartup();

    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Database: ${process.env.DB_NAME || 'debt_management_app'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
