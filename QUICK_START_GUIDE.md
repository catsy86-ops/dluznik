# 🚀 Quick Start Guide - Running Your App

## Prerequisites
✅ PostgreSQL running in Docker  
✅ Node.js installed  
✅ All dependencies installed  
✅ `.env` file configured  

---

## Starting the App

### 1️⃣ Start Backend Server

```powershell
# From project root
npm run dev
```

**Expected output:**
```
✓ Database connection established
✓ Database migrations completed
✓ Database initialization successful
✓ Server is running on port 3000
```

### 2️⃣ Start Frontend (in separate terminal)

```powershell
# From client directory
cd client
npm run dev
```

**Expected output:**
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Accessing the App

### Frontend
- **URL:** http://localhost:5173
- **Default Port:** 5173

### Backend API
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

---

## Testing Features

### 1. Create Account
```
Email: test@example.com
Password: password123
```

### 2. Create a Loan
```
Borrower: John Doe
Amount: 5000 PLN
Due Date: 2026-12-31
Description: Personal loan
```

### 3. View Advanced Features
Navigate to loan detail page to see:
- 📊 **Loan Health Score** - Health metrics
- 📅 **Payment Schedule** - 12-month forecast
- 💹 **Interest Breakdown** - Principal vs Interest
- 🔮 **Payment Forecast** - Completion prediction
- 💡 **Payment Suggestions** - Smart recommendations
- ⚙️ **Payment Rules** - Automation setup
- 📋 **Loan Comparison** - Compare multiple loans

---

## API Endpoints

### Health Check
```
GET http://localhost:3000/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Loans
```
POST /api/loans
GET /api/loans
GET /api/loans/:id
PUT /api/loans/:id
DELETE /api/loans/:id
```

### Advanced Features
```
GET /api/loans/:id/payment-schedule
POST /api/loans/:id/suggest-payment
GET /api/loans/:id/interest-breakdown
GET /api/loans/:id/health-score
GET /api/loans/:id/forecast
GET /api/loans/:id/rules
```

---

## Build & Deployment

### Build for Production

```powershell
# Backend
npm run build

# Frontend
cd client
npm run build
```

### Run Tests

```powershell
# Unit tests
npm test

# Property-based tests
npm test:properties
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Error
```powershell
# Verify PostgreSQL running
docker ps | findstr postgres

# Restart PostgreSQL
docker restart postgres-dluznik
```

### Clear Cache
```powershell
# Client
cd client
rm -r node_modules .vite dist
npm install

# Backend
rm -r dist node_modules
npm install
```

---

## Useful Commands

```powershell
# Backend
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Check code quality
npm run db:seed          # Seed sample data

# Frontend (from client/)
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
npm run type-check       # TypeScript check

# Database
.\db.ps1 users           # List users
.\db.ps1 loans           # List loans
.\db.ps1 connect         # Connect to DB
```

---

## Feature Overview

### 📊 Loan Health Score
Real-time health assessment based on:
- Payment timeliness (40%)
- Remaining balance (40%)
- Payment velocity (20%)
- **Score:** 0-100 (Green/Yellow/Orange/Red)

### 💡 Payment Suggestions
Three payment options:
- **Minimum:** Avoid default
- **Recommended:** Ideal payment now
- **Full:** Complete payoff
- **Shows:** Interest savings if paid early

### 📅 Payment Schedule
12-month forecast showing:
- Monthly suggested payment
- Principal vs Interest breakdown
- Remaining balance by month
- Completion projection

### 💹 Interest Breakdown
Two visualization modes:
- **Breakdown:** Current principal/interest split
- **Real-time:** Live accrual calculator
- Shows future interest costs

### 🔮 Payment Forecast
Predictive analytics:
- Estimated completion date
- Confidence level
- 3 scenarios (conservative/moderate/aggressive)
- Overdue risk alerts

### ⚙️ Payment Rules
Automated payment rules:
- Fixed amount rules: "Pay 500 PLN monthly"
- Percentage rules: "Pay 10% of balance"
- Triggers: Daily, Weekly, Monthly
- AI suggestions based on patterns

### 📊 Loan Comparison
Compare up to 3 loans:
- Side-by-side metrics
- Key indicators highlighted
- Summary statistics
- Quick decision making

---

## Dark Mode

Toggle dark mode with button in top-right corner. Persists in browser storage.

**Colors:**
- Dark background: #1a1a1a
- Light text: #f5f5f5
- Primary accent: #6366f1
- Success: #22c55e
- Danger: #ef4444
- Warning: #f59e0b

---

## Mobile Responsive

All features work perfectly on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

Touch-friendly buttons and layouts.

---

## Performance Tips

1. **Clear cache** if components don't update
2. **Hard refresh** (Ctrl+Shift+R) browser if styles are wrong
3. **Check console** (F12) for errors
4. **Database queries** are optimized - no N+1 issues

---

## Getting Help

### Check These Files
- `IMPLEMENTATION_FINAL_SUMMARY.md` - Complete feature summary
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Architecture overview
- `DATABASE_ACCESS.md` - Database connection info
- `NEXT_STEPS.md` - Additional setup steps

### Run Diagnostics
```powershell
# Check TypeScript
npm run lint

# Verify database
docker logs postgres-dluznik

# Check running processes
docker ps
npm list
```

---

## Next Steps

1. ✅ Start the app
2. ✅ Create test data
3. ✅ Explore all features
4. ✅ Read IMPLEMENTATION_FINAL_SUMMARY.md
5. ✅ Deploy to production

**Ready to go! 🚀**

---

**Last Updated:** May 22, 2026
**Status:** Production Ready
