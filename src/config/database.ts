import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Obligation } from '../models/Obligation';
import { Transaction } from '../models/Transaction';
import { PaymentRule } from '../models/PaymentRule';
import { CreateUserTable1704000000000 } from '../migrations/1704000000000-CreateUserTable';
import { CreateLoanTable1704000000001 } from '../migrations/1704000000001-CreateLoanTable';
import { CreatePaymentRuleTable1704000000100 } from '../migrations/1704000000100-CreatePaymentRuleTable';

dotenv.config();

// Parse DATABASE_URL if provided (Railway/Heroku style)
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // remove leading /
    };
  } catch {
    return null;
  }
}

const dbUrl = process.env.DATABASE_URL;
const dbFromUrl = dbUrl ? parseDatabaseUrl(dbUrl) : null;

export const databaseConfig = {
  host: dbFromUrl?.host || process.env.DB_HOST || 'localhost',
  port: dbFromUrl?.port || parseInt(process.env.DB_PORT || '5432', 10),
  username: dbFromUrl?.username || process.env.DB_USERNAME || 'postgres',
  password: dbFromUrl?.password || process.env.DB_PASSWORD || 'postgres',
  database: dbFromUrl?.database || process.env.DB_NAME || 'debt_management_app',
  synchronize: false, // always use migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' || (!!dbUrl && !dbUrl.includes('localhost')),
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  expiresIn: process.env.JWT_EXPIRATION || '24h',
};

export const sessionConfig = {
  timeout: parseInt(process.env.SESSION_TIMEOUT || '1800000', 10), // 30 minutes in milliseconds
};

/**
 * TypeORM DataSource Configuration
 * Initializes database connection with all entities and migrations
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: databaseConfig.synchronize,
  logging: databaseConfig.logging,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
  entities: [User, Loan, Obligation, Transaction, PaymentRule],
  migrations: [CreateUserTable1704000000000, CreateLoanTable1704000000001, CreatePaymentRuleTable1704000000100],
  subscribers: [],
  migrationsRun: false,
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connection established');
    }
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
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
