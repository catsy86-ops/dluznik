# Setup Summary - Dluznik Debt Management App

## Current Status
✅ **App Code**: Ready to run  
✅ **Dependencies**: Installed  
✅ **Docker**: Installed (v25.0.3)  
❌ **Docker Daemon**: Not running  
❌ **PostgreSQL**: Not running  

## What You Need to Do

### Option A: Automated Setup (Easiest)
Run the PowerShell script:
```powershell
.\start-dev.ps1
```

This script will:
1. Check Docker is running (start it if needed)
2. Create/start PostgreSQL container
3. Install npm dependencies (if needed)
4. Start the development server

### Option B: Manual Setup (5 minutes)

**Step 1: Start Docker Desktop**
- Press Windows Key
- Type: `Docker Desktop`
- Click to open
- Wait 1-2 minutes for it to fully start

**Step 2: Start PostgreSQL**
```powershell
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

**Step 3: Start the App**
```powershell
npm run dev
```

**Step 4: Verify It Works**
```powershell
curl http://localhost:3000/health
```

## Documentation Files

| File | Purpose |
|------|---------|
| `QUICK_FIX.md` | 5-minute quick start guide |
| `DATABASE_SETUP_WINDOWS.md` | Complete setup guide with all options |
| `START_DEV.md` | Original quick start (see QUICK_FIX.md instead) |
| `RUNNING_LOCALLY.md` | Detailed local development guide |
| `start-dev.ps1` | Automated PowerShell setup script |

## Common Issues & Solutions

### Docker Daemon Not Running
**Error**: `docker: error during connect: this error may indicate that the docker daemon is not running`

**Solution**: 
1. Open Docker Desktop (Windows Key → type "Docker Desktop")
2. Wait for it to fully start (1-2 minutes)
3. Try again

### PostgreSQL Service Not Found
**Error**: `Nazwa usługi jest nieprawidłowa` (Invalid service name)

**Solution**: PostgreSQL is not installed as a Windows service. Use Docker instead (see Option B above).

### Port Already in Use
**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or use a different port in .env
# PORT=3001
```

### Can't Connect to Database
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Verify Docker container is running: `docker ps`
2. If not listed, start it: `docker start postgres-dluznik`
3. If that fails, create it: `docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15`

## Useful Commands

### Docker
```powershell
# List running containers
docker ps

# Start PostgreSQL container
docker start postgres-dluznik

# Stop PostgreSQL container
docker stop postgres-dluznik

# View PostgreSQL logs
docker logs postgres-dluznik

# Remove container (careful!)
docker rm postgres-dluznik
```

### App
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

### Database
```powershell
# Connect to PostgreSQL
psql -U postgres -d debt_management_app

# List databases
\l

# List tables
\dt

# Quit
\q
```

## Next Steps

1. **Choose setup method** (Automated or Manual)
2. **Follow the steps** to start PostgreSQL and the app
3. **Verify it works** by visiting http://localhost:3000/health
4. **Start developing** or running tests

## Project Status

### Completed
- ✅ Project setup and configuration
- ✅ Database models (User, Loan, Obligation, Transaction)
- ✅ Authentication system (register, login, JWT)
- ✅ Loan management (CRUD operations)
- ✅ Obligation management (CRUD operations)
- ✅ Payment/Transaction system
- ✅ 157+ unit and property-based tests

### In Progress
- 🔄 Loan/Obligation listing with sorting, filtering, pagination
- 🔄 Transaction history display
- 🔄 Financial summary calculations
- 🔄 Notifications system
- 🔄 Data export (CSV)
- 🔄 Security hardening
- 🔄 API documentation

### API Endpoints Available
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user

POST   /api/loans                  - Create loan
GET    /api/loans                  - List user's loans
GET    /api/loans/:id              - Get loan details
PUT    /api/loans/:id              - Update loan
DELETE /api/loans/:id              - Delete loan

POST   /api/obligations            - Create obligation
GET    /api/obligations            - List user's obligations
GET    /api/obligations/:id        - Get obligation details
PUT    /api/obligations/:id        - Update obligation
DELETE /api/obligations/:id        - Delete obligation

POST   /api/loans/:id/payments     - Register loan payment
GET    /api/loans/:id/payments     - Get loan payment history
POST   /api/obligations/:id/payments - Register obligation payment
GET    /api/obligations/:id/payments - Get obligation payment history

GET    /health                     - Health check
```

## Support

For detailed information, see the documentation files listed above.

For issues with Docker or PostgreSQL, see `DATABASE_SETUP_WINDOWS.md`.

For quick troubleshooting, see `QUICK_FIX.md`.
