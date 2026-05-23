# Running the Dluznik App Locally

## Prerequisites

You need PostgreSQL running on your machine. Here are the options:

### Option 1: PostgreSQL Service (Windows)
If you have PostgreSQL installed as a Windows service:

```powershell
# Start PostgreSQL service
net start postgresql-x64-15

# Or use Services app: Services.msc → PostgreSQL → Start
```

### Option 2: Docker (Recommended)
If you have Docker installed:

```bash
# Start PostgreSQL in Docker
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15

# Stop it later with:
docker stop postgres-dluznik
```

### Option 3: PostgreSQL Portable
Download and run PostgreSQL portable from https://www.postgresql.org/download/

## Setup Steps

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Create .env file** (if not already done):
```bash
# Copy the example
copy .env.example .env

# Edit .env with your database credentials (defaults should work):
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=debt_management_app
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

3. **Start PostgreSQL** (see Prerequisites above)

4. **Run the app**:
```bash
npm run dev
```

You should see:
```
✓ Database connection established
✓ Database migrations completed
✓ Database initialization successful
✓ Server is running on port 3000
```

## Testing

Run tests without needing a database:
```bash
npm test
```

## Troubleshooting

### "ECONNREFUSED" Error
- PostgreSQL is not running
- Check if port 5432 is in use: `netstat -ano | findstr :5432`
- Start PostgreSQL service (see Prerequisites)

### "Database already exists" Error
- Drop the database: `psql -U postgres -c "DROP DATABASE debt_management_app;"`
- Or use a different DB_NAME in .env

### Port 3000 Already in Use
- Change PORT in .env: `PORT=3001`
- Or kill the process: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

## API Endpoints

Once running, test the API:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Database Management

### Connect to PostgreSQL
```bash
psql -U postgres -d debt_management_app
```

### View tables
```sql
\dt
```

### View users
```sql
SELECT id, email, "createdAt" FROM "user";
```

### Reset database
```bash
psql -U postgres -c "DROP DATABASE debt_management_app;"
psql -U postgres -c "CREATE DATABASE debt_management_app;"
```

## Next Steps

- Run tests: `npm test`
- Build for production: `npm run build`
- Check code quality: `npm run lint`
