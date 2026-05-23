# Database Setup for Windows - Complete Guide

## Current Status
- ✅ Docker is installed (version 25.0.3)
- ❌ Docker daemon is NOT running
- ❌ PostgreSQL is NOT installed as a service

## Option 1: Start Docker Desktop (Recommended)

### Step 1: Start Docker Desktop
1. Open **Start Menu** and search for "Docker Desktop"
2. Click to launch Docker Desktop
3. Wait for it to fully start (you'll see the Docker icon in system tray)
4. This may take 1-2 minutes

### Step 2: Verify Docker is Running
```powershell
docker ps
```

You should see output like:
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### Step 3: Start PostgreSQL Container
```powershell
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

### Step 4: Verify PostgreSQL is Running
```powershell
docker ps
```

You should see the postgres container listed.

### Step 5: Start Your App
```powershell
npm run dev
```

---

## Option 2: Install PostgreSQL Locally (Alternative)

If you don't want to use Docker, install PostgreSQL directly:

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15 (or latest)
3. Run the installer

### Step 2: Installation Settings
- **Installation Directory**: `C:\Program Files\PostgreSQL\15` (default is fine)
- **Port**: `5432` (default)
- **Username**: `postgres`
- **Password**: `postgres` (or your choice - update .env if different)
- **Locale**: Your system locale

### Step 3: Complete Installation
- Let it install pgAdmin (optional but useful)
- Finish the installation

### Step 4: Verify PostgreSQL is Running
```powershell
# Check if service is running
Get-Service | Where-Object {$_.Name -like '*postgres*'}

# Or check if port 5432 is listening
netstat -ano | findstr :5432
```

### Step 5: Create Database (if needed)
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE debt_management_app;
\q
```

### Step 6: Start Your App
```powershell
npm run dev
```

---

## Option 3: Use WSL2 with Docker (Advanced)

If you have WSL2 installed:

```powershell
# Start WSL2
wsl

# Inside WSL, install and run PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Then from Windows, connect to WSL PostgreSQL
# Update .env: DB_HOST=localhost (or WSL IP)
```

---

## Troubleshooting

### Docker Desktop Won't Start
1. Check if Hyper-V is enabled:
   ```powershell
   Get-WindowsOptionalFeature -Online -FeatureName Hyper-V
   ```
2. If not enabled, enable it:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Hyper-V -All
   ```
3. Restart your computer
4. Try Docker Desktop again

### PostgreSQL Port Already in Use
```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or use a different port in .env
# DB_PORT=5433
```

### Can't Connect to PostgreSQL
1. Verify it's running:
   ```powershell
   docker ps  # for Docker
   # or
   Get-Service postgresql*  # for local install
   ```

2. Check credentials in .env:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=debt_management_app
   ```

3. Test connection:
   ```powershell
   psql -h localhost -U postgres -d debt_management_app
   ```

---

## Quick Reference

### Docker Commands
```powershell
# Start container
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15

# Stop container
docker stop postgres-dluznik

# Start existing container
docker start postgres-dluznik

# Remove container
docker rm postgres-dluznik

# View logs
docker logs postgres-dluznik
```

### PostgreSQL Commands
```powershell
# Connect to database
psql -U postgres -d debt_management_app

# List databases
\l

# List tables
\dt

# Quit
\q

# Reset database
psql -U postgres -c "DROP DATABASE debt_management_app;"
psql -U postgres -c "CREATE DATABASE debt_management_app;"
```

### App Commands
```powershell
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

---

## Recommended Setup

**For Development**: Use Docker Desktop (Option 1)
- Easier to manage
- No system-wide installation
- Easy to reset/clean up
- Can run multiple versions

**For Production**: Use local PostgreSQL (Option 2)
- Better performance
- Easier to backup
- Simpler monitoring

---

## Next Steps

1. Choose an option above (Docker Desktop recommended)
2. Follow the steps to set up PostgreSQL
3. Run `npm run dev`
4. Test with `curl http://localhost:3000/health`
5. Continue with app development

Need help? Check the error messages and refer to the Troubleshooting section above.
