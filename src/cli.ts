import { initializeDatabase, closeDatabase } from './config/database';
import { runMigrations, revertMigration, showMigrations } from './utils/migration';

/**
 * CLI tool for database management
 * Usage: ts-node src/cli.ts <command>
 * Commands:
 *   - migrate: Run all pending migrations
 *   - revert: Revert the last migration
 *   - show: Show all migrations
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    await initializeDatabase();

    switch (command) {
      case 'migrate':
        await runMigrations();
        break;
      case 'revert':
        await revertMigration();
        break;
      case 'show':
        await showMigrations();
        break;
      default:
        console.log('Unknown command:', command);
        console.log('Available commands: migrate, revert, show');
        process.exit(1);
    }

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('CLI Error:', error);
    await closeDatabase();
    process.exit(1);
  }
}

main();
