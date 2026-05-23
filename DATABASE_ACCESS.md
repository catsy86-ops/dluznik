# Accessing PostgreSQL Database

Since PostgreSQL is running in Docker, you don't need `psql` installed locally. Use Docker commands instead.

## Quick Access

### Connect to PostgreSQL via Docker
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app
```

Then you can use standard PostgreSQL commands:
```sql
-- List tables
\dt

-- View users
SELECT id, email, "createdAt" FROM "user";

-- View loans
SELECT id, "borrowerName", "originalAmount", "currentBalance" FROM loan;

-- View obligations
SELECT id, "creditorName", "originalAmount", "currentBalance" FROM obligation;

-- View transactions
SELECT id, "loanId", "obligationId", amount, "balanceBefore", "balanceAfter" FROM transactions;

-- Exit
\q
```

---

## Common Database Operations

### View All Tables
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "\dt"
```

### View Users
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT id, email, \"createdAt\" FROM \"user\";"
```

### View Loans
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT id, \"borrowerName\", \"originalAmount\", \"currentBalance\", status FROM loan;"
```

### View Obligations
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT id, \"creditorName\", \"originalAmount\", \"currentBalance\", status FROM obligation;"
```

### View Transactions
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT id, \"loanId\", \"obligationId\", amount, \"balanceBefore\", \"balanceAfter\", \"createdAt\" FROM transactions;"
```

### Count Records
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT 'users' as table_name, COUNT(*) FROM \"user\" UNION ALL SELECT 'loans', COUNT(*) FROM loan UNION ALL SELECT 'obligations', COUNT(*) FROM obligation UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;"
```

### Reset Database (Delete All Data)
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS loan CASCADE;
DROP TABLE IF EXISTS obligation CASCADE;
DROP TABLE IF EXISTS \"user\" CASCADE;
"
```

Then restart the app to recreate tables:
```powershell
npm run dev
```

---

## Interactive Access

### Open Interactive PostgreSQL Shell
```powershell
docker exec -it postgres-dluznik psql -U postgres -d debt_management_app
```

Once inside, you can run commands:
```sql
-- List all tables
\dt

-- Describe a table
\d "user"
\d loan
\d obligation
\d transactions

-- Show all databases
\l

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Exit
\q
```

---

## Using Docker Desktop GUI

You can also use Docker Desktop's GUI to access the database:

1. Open Docker Desktop
2. Go to **Containers** tab
3. Find **postgres-dluznik** container
4. Click on it to see details
5. Click **Exec** tab
6. Run commands directly

---

## Alternative: Install PostgreSQL Client Only

If you want `psql` available in PowerShell without installing full PostgreSQL:

### Option 1: Add PostgreSQL to PATH
If you have PostgreSQL installed elsewhere:
```powershell
# Find PostgreSQL installation
Get-ChildItem "C:\Program Files" -Filter "PostgreSQL*" -Recurse

# Add to PATH (replace version number)
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Now psql should work
psql -U postgres -h localhost -d debt_management_app
```

### Option 2: Use PostgreSQL Docker Image
```powershell
# Run psql from Docker image
docker run -it --rm postgres:15 psql -h host.docker.internal -U postgres -d debt_management_app
```

### Option 3: Install PostgreSQL Locally
Download from: https://www.postgresql.org/download/windows/

---

## Troubleshooting

### "Container not found"
```powershell
# Check if container is running
docker ps

# If not listed, start it
docker start postgres-dluznik

# If that fails, create it
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

### "Connection refused"
```powershell
# Verify container is running
docker ps | findstr postgres-dluznik

# Check logs
docker logs postgres-dluznik

# Restart container
docker restart postgres-dluznik
```

### "Permission denied"
Make sure you're using the correct credentials:
- Username: `postgres`
- Password: `postgres`
- Database: `debt_management_app`

---

## Quick Reference

| Task | Command |
|------|---------|
| Connect to DB | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app` |
| List tables | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "\dt"` |
| View users | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM \"user\";"` |
| View loans | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM loan;"` |
| View obligations | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM obligation;"` |
| View transactions | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "SELECT * FROM transactions;"` |
| Reset database | `docker exec -it postgres-dluznik psql -U postgres -d debt_management_app -c "DROP TABLE IF EXISTS transactions, loan, obligation, \"user\" CASCADE;"` |

---

## Next Steps

1. Use `docker exec` commands above to access your database
2. Or install PostgreSQL locally if you prefer `psql` command
3. Or use Docker Desktop GUI for visual access

All three methods work - choose what's most comfortable for you!
