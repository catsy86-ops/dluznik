# Quick Fix - Get Running in 5 Minutes

## The Problem
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
= PostgreSQL is not running

## The Solution

### Step 1: Start Docker Desktop
1. Press **Windows Key**
2. Type: `Docker Desktop`
3. Click to open it
4. **Wait 1-2 minutes** for it to fully start
5. You'll see Docker icon in system tray when ready

### Step 2: Start PostgreSQL
Open PowerShell and run:
```powershell
docker run --name postgres-dluznik -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=debt_management_app -p 5432:5432 -d postgres:15
```

You should see output like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 3: Start Your App
```powershell
npm run dev
```

You should see:
```
✓ Database connection established
✓ Database migrations completed
✓ Database initialization successful
✓ Server is running on port 3000
```

### Step 4: Test It Works
Open another PowerShell and run:
```powershell
curl http://localhost:3000/health
```

You should get a JSON response with status "OK".

---

## Done! 🎉

Your app is now running at `http://localhost:3000`

### To Stop Everything
```powershell
# Stop the app: Press Ctrl+C in the terminal

# Stop PostgreSQL:
docker stop postgres-dluznik
```

### To Start Again Later
```powershell
# Start Docker Desktop (same as Step 1)

# Start PostgreSQL:
docker start postgres-dluznik

# Start app:
npm run dev
```

---

## If It Still Doesn't Work

### Docker Won't Start
- Make sure Docker Desktop is fully launched (check system tray)
- Restart Docker Desktop
- See `DATABASE_SETUP_WINDOWS.md` for detailed troubleshooting

### Still Getting Connection Error
- Verify Docker container is running: `docker ps`
- Check if port 5432 is in use: `netstat -ano | findstr :5432`
- See `DATABASE_SETUP_WINDOWS.md` for more help

---

## Need More Details?
See `DATABASE_SETUP_WINDOWS.md` for complete setup guide with all options.
