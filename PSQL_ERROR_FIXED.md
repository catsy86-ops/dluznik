# psql Command Not Found - FIXED ✅

## The Error
```
psql : The term 'psql' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## The Reason
PostgreSQL is not installed locally on your Windows machine. You're using Docker to run PostgreSQL in a container instead, which is actually better for development!

## The Solution

### Option 1: Use the Helper Script (Easiest) ⭐
I've created a PowerShell script that makes database access super easy:

```powershell
# View all users
.\db.ps1 users

# View all loans
.\db.ps1 loans

# View all obligations
.\db.ps1 obligations

# View all transactions
.\db.ps1 transactions

# Connect interactively
.\db.ps1 connect

# See all commands
.\db.ps1 help
```

### Option 2: Use Docker Commands Directly
```powershell
# Connect to database
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app

# View users
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM \"user\";"

# View loans
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM loan;"
```

### Option 3: Install PostgreSQL Locally (Optional)
If you want `psql` available globally:

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Run the installer
3. Choose port 5432 (default)
4. Set password to `postgres` (or update .env)
5. Complete installation
6. Now `psql` will work in PowerShell

---

## Files Created

| File | Purpose |
|------|---------|
| **db.ps1** | 👈 **USE THIS** - Helper script for database access |
| **DATABASE_ACCESS.md** | Complete guide to accessing the database |
| **DB_QUICK_REFERENCE.txt** | Quick reference card |

---

## Quick Start

### Using the Helper Script
```powershell
# Make the script executable (one time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# View users
.\db.ps1 users

# Connect interactively
.\db.ps1 connect

# See all options
.\db.ps1 help
```

### Common Tasks

**View all users:**
```powershell
.\db.ps1 users
```

**View all loans:**
```powershell
.\db.ps1 loans
```

**View all obligations:**
```powershell
.\db.ps1 obligations
```

**View all transactions:**
```powershell
.\db.ps1 transactions
```

**Count records:**
```powershell
.\db.ps1 count
```

**Connect interactively:**
```powershell
.\db.ps1 connect
```

Then inside the interactive shell:
```sql
-- List tables
\dt

-- View specific table
SELECT * FROM "user";

-- Exit
\q
```

---

## Why Docker is Better for Development

✅ **No installation needed** - PostgreSQL runs in a container  
✅ **Easy to reset** - Just delete the container and start fresh  
✅ **Isolated environment** - Doesn't affect your system  
✅ **Easy to share** - Same setup for all developers  
✅ **Easy to upgrade** - Just use a different image version  

---

## Database Credentials

```
Host:     localhost
Port:     5432
Username: postgres
Password: postgres
Database: debt_management_app
```

---

## Troubleshooting

### Container Not Running
```powershell
# Check if running
docker ps

# Start it
docker start postgres-dluznik

# If that fails, create it
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

### Script Execution Policy Error
```powershell
# Allow scripts to run
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.\db.ps1 users
```

### Connection Refused
```powershell
# Verify container is running
docker ps | findstr postgres-dluznik

# Check logs
docker logs postgres-dluznik

# Restart if needed
docker restart postgres-dluznik
```

---

## Next Steps

1. **Use the helper script**: `.\db.ps1 users`
2. **Or connect interactively**: `.\db.ps1 connect`
3. **Or see DATABASE_ACCESS.md** for more options

---

## Summary

✅ **Problem**: psql not found  
✅ **Reason**: PostgreSQL not installed locally  
✅ **Solution**: Use Docker commands or the helper script  
✅ **Recommended**: Use `.\db.ps1` helper script  

You're all set! Use the helper script to access your database. 🚀
