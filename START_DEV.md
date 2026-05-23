# Quick Start Guide

## TL;DR - Get Running in 2 Steps

### Step 1: Start PostgreSQL

**Option A - Docker (Easiest)**
```powershell
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

**Option B - Windows Service**
```powershell
net start postgresql-x64-15
```

### Step 2: Start the App
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

## What's the Error?

The error you're seeing is:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

This means **PostgreSQL is not running**. The app is trying to connect to the database on port 5432, but nothing is listening there.

## Solution

Choose one of the options above to start PostgreSQL, then run `npm run dev` again.

## Verify It's Working

```bash
# In another terminal, test the health endpoint
curl http://localhost:3000/health
```

You should get:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2024-05-21T...",
    "environment": "development"
  }
}
```

## Stop Everything

```bash
# Stop the app: Press Ctrl+C in the terminal

# Stop PostgreSQL (if using Docker):
docker stop postgres-dluznik

# Stop PostgreSQL (if using Windows Service):
net stop postgresql-x64-15
```

## Need Help?

See `RUNNING_LOCALLY.md` for detailed troubleshooting and database management commands.
