import { AppDataSource, initializeDatabase } from './database';
import { runMigrations } from '../utils/migration';

// Re-export AppDataSource for use in repositories
export { AppDataSource };

/**
 * Initialize database on application startup
 * This function:
 * 1. Initializes the database connection
 * 2. Runs all pending migrations
 * 3. Ensures the database is ready for use
 */
export async function initializeDatabaseOnStartup(): Promise<void> {
  try {
    console.log('Initializing database...');

    // Initialize connection
    await initializeDatabase();

    // Run migrations
    await runMigrations();
    console.log('✓ Database migrations completed');

    console.log('✓ Database initialization successful');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Cleanup database on application shutdown
 */
export async function cleanupDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Database connection closed');
    }
  } catch (error) {
    console.error('✗ Error closing database connection:', error);
    throw error;
  }
}
