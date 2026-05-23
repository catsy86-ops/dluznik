# Database Setup Guide

## Overview

This application uses TypeORM with PostgreSQL for data persistence. The database configuration is managed through environment variables and migrations.

## Prerequisites

- PostgreSQL 12 or higher
- Node.js 16 or higher
- npm or yarn

## Installation

### 1. Install PostgreSQL

#### Windows
- Download from https://www.postgresql.org/download/windows/
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE debt_management_app;

# Exit
\q
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the database credentials:

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=debt_management_app
DB_LOGGING=false
DB_SSL=false
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Migrations

```bash
npm run db:migrate
```

This will create all necessary tables in the database.

## Database Configuration

### Configuration File

The database configuration is defined in `src/config/database.ts`:

- **Type**: PostgreSQL
- **Host**: Configurable via `DB_HOST` environment variable
- **Port**: Configurable via `DB_PORT` environment variable (default: 5432)
- **Username**: Configurable via `DB_USERNAME` environment variable
- **Password**: Configurable via `DB_PASSWORD` environment variable
- **Database**: Configurable via `DB_NAME` environment variable
- **Synchronize**: Disabled in production, enabled in development
- **Logging**: Configurable via `DB_LOGGING` environment variable
- **SSL**: Configurable via `DB_SSL` environment variable

### Connection Pool

TypeORM manages connection pooling automatically. The default pool size is 10 connections.

## Migrations

### What are Migrations?

Migrations are version-controlled database schema changes. They allow you to:
- Track database schema changes over time
- Collaborate with team members
- Rollback changes if needed
- Maintain consistency across environments

### Migration Commands

#### Run Migrations
```bash
npm run db:migrate
```

Runs all pending migrations in order.

#### Revert Last Migration
```bash
npm run db:revert
```

Reverts the most recently applied migration.

#### Show Migration Status
```bash
npm run db:show
```

Displays the status of all migrations.

### Creating New Migrations

#### Automatic Migration Generation

TypeORM can generate migrations automatically by comparing your entities with the database schema:

```bash
npx typeorm migration:generate src/migrations/MigrationName
```

#### Manual Migration Creation

Create a new file in `src/migrations/` with the naming convention `TIMESTAMP-MigrationName.ts`:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class MigrationName1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
  }
}
```

## Database Schema

### Tables

#### user
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `passwordHash` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)
- `lastLoginAt` (TIMESTAMP, Nullable)
- `notificationsEnabled` (BOOLEAN)

Additional tables will be created as migrations are added:
- `loan` - For loans given to others
- `obligation` - For debts owed to others
- `transaction` - For payment records
- `notification` - For user notifications
- `session` - For user sessions

## Troubleshooting

### Connection Refused

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify PostgreSQL is listening on the correct port

### Database Does Not Exist

**Error**: `database "debt_management_app" does not exist`

**Solution**:
```bash
psql -U postgres
CREATE DATABASE debt_management_app;
\q
```

### Migration Failed

**Error**: `Migration failed`

**Solution**:
1. Check the migration file for syntax errors
2. Ensure the database is accessible
3. Review the error message for specific issues
4. Revert the migration if needed: `npm run db:revert`

### Permission Denied

**Error**: `permission denied for schema public`

**Solution**:
```bash
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE debt_management_app TO postgres;
\q
```

## Development Workflow

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Create database
psql -U postgres
CREATE DATABASE debt_management_app;
\q

# 4. Run migrations
npm run db:migrate

# 5. Start development server
npm run dev
```

### Adding New Features

1. Create entity files in `src/models/`
2. Create migration: `npx typeorm migration:generate src/migrations/MigrationName`
3. Run migration: `npm run db:migrate`
4. Create repository in `src/repositories/`
5. Create service in `src/services/`
6. Create controller in `src/controllers/`

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Production Deployment

### Environment Variables

Set these environment variables in your production environment:

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=debt_management_app
DB_LOGGING=false
DB_SSL=true
JWT_SECRET=your-secure-jwt-secret
```

### Pre-deployment Checklist

- [ ] Database is backed up
- [ ] Migrations have been tested locally
- [ ] Environment variables are configured
- [ ] SSL is enabled for database connection
- [ ] Connection pooling is configured appropriately
- [ ] Monitoring and logging are set up

### Running Migrations in Production

```bash
# 1. Backup database
pg_dump -U postgres debt_management_app > backup.sql

# 2. Run migrations
npm run db:migrate

# 3. Verify migrations
npm run db:show
```

## Performance Optimization

### Indexing

Indices are automatically created for:
- `user.email` - For fast email lookups during authentication

Additional indices can be added in migrations for frequently queried fields.

### Connection Pooling

TypeORM manages connection pooling automatically. For high-traffic applications, consider:
- Increasing pool size in `src/config/database.ts`
- Using a connection pool manager like PgBouncer

### Query Optimization

- Use `select` to fetch only needed columns
- Use `relations` to eager load related data
- Use pagination for large result sets
- Add indices for frequently filtered columns

## Backup and Recovery

### Backup Database

```bash
pg_dump -U postgres debt_management_app > backup.sql
```

### Restore Database

```bash
psql -U postgres debt_management_app < backup.sql
```

### Automated Backups

Consider setting up automated backups using:
- PostgreSQL's built-in backup tools
- Cloud provider backup services
- Third-party backup solutions

## References

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeORM Migrations](https://typeorm.io/migrations)
