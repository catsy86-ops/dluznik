import { AppDataSource } from '../config/database';

/**
 * Run all pending migrations
 * Should be called during application startup
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('Running migrations...');
    const migrations = await AppDataSource.runMigrations();
    console.log(`Successfully ran ${migrations.length} migrations`);
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Revert the last migration
 * Useful for development and testing
 */
export async function revertMigration(): Promise<void> {
  try {
    console.log('Reverting last migration...');
    await AppDataSource.undoLastMigration();
    console.log('Successfully reverted last migration');
  } catch (error) {
    console.error('Error reverting migration:', error);
    throw error;
  }
}

/**
 * Show all migrations
 * Lists all migrations and their status
 */
export async function showMigrations(): Promise<void> {
  try {
    const migrations = await AppDataSource.showMigrations();
    console.log('Migrations:', migrations);
  } catch (error) {
    console.error('Error showing migrations:', error);
    throw error;
  }
}
