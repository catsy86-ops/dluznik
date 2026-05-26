# 🎉 LOCAL PREVIEW - Aplikacja Działa!

## ✅ Status - LIVE LOCALLY

```
✅ PostgreSQL:  http://localhost:5432 (port)
✅ Backend:     http://localhost:3000
✅ Frontend:    http://localhost:5174
✅ Database:    debt_management_app
```

---

## 🌐 Otwórz w Przeglądarce

### Frontend (React + Vite)
```
👉 http://localhost:5174
```

### Backend Health Check
```
curl http://localhost:3000/health
```

---

## 🎯 Co Możesz Testować Lokalnie

### 1. Rejestracja
- Idź na: http://localhost:5174
- Kliknij **Register**
- Wpisz email i hasło
- Kliknij **Sign Up**

### 2. Login
- Wpisz email i hasło które przed chwilą stworzyłeś
- Kliknij **Sign In**

### 3. Dashboard
- Powinieneś zobaczyć dashboard z:
  - Loan Management
  - Payment tracking
  - Financial summary
  - Analytics

### 4. Nowe Auth UX Features (Phase 1)
- ✅ Show/Hide Password Toggle
- ✅ Smart Email Validation (typo detection)
- ✅ Password Strength Indicator (real-time)
- ✅ Remember Me checkbox
- ✅ Better error messages
- ✅ Autocomplete support

---

## 🧪 Testuj API Bezpośrednio

### Health Check
```powershell
curl http://localhost:3000/health
```

### Register User
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@example.com",
    "password":"Password123!",
    "confirmPassword":"Password123!"
  }'
```

### Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@example.com",
    "password":"Password123!"
  }'
```

### Create Loan
```powershell
$token = "JWT_TOKEN_FROM_LOGIN"

curl -X POST http://localhost:3000/api/loans `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    "name":"Car Loan",
    "amount":25000,
    "interest":3.5,
    "term":60,
    "startDate":"2024-01-01"
  }'
```

---

## 📊 Baza Danych

Możesz podejrzeć bazę danych:

```powershell
# Połącz do PostgreSQL
psql -h localhost -U postgres -d debt_management_app

# Lub użyj skryptu
.\db.ps1 users        # Pokaż users
.\db.ps1 loans        # Pokaż loans
.\db.ps1 obligations  # Pokaż obligations
.\db.ps1 connect      # Interaktywne połączenie
```

---

## 📂 Project Structure

```
/
├── src/                      Backend code
│   ├── controllers/          API handlers
│   ├── services/             Business logic
│   ├── models/               Database entities
│   ├── routes/               API routes
│   └── index.ts              Main entry
│
├── client/                   React Frontend
│   ├── src/
│   │   ├── components/       UI components
│   │   ├── pages/            Page components
│   │   ├── hooks/            Custom React hooks
│   │   └── App.tsx           Main component
│   └── package.json          Frontend dependencies
│
├── .env                      Environment variables
├── Dockerfile               Multi-stage Docker build
├── docker-compose.yml       Development setup
└── package.json             Backend dependencies
```

---

## 🔌 Endpoints Dostępne

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Loans
```
GET    /api/loans
POST   /api/loans
GET    /api/loans/:id
PUT    /api/loans/:id
DELETE /api/loans/:id
```

### Obligations
```
GET    /api/obligations
POST   /api/obligations
GET    /api/obligations/:id
PUT    /api/obligations/:id
DELETE /api/obligations/:id
```

### Payments
```
POST   /api/loans/:id/payments
GET    /api/loans/:id/payments
POST   /api/obligations/:id/payments
GET    /api/obligations/:id/payments
```

### Health
```
GET    /health
```

---

## 🛑 Stop Aplikacji (Jeśli Trzeba)

```powershell
# Stop backend
# (Ctrl+C w terminalu gdzie działa backend)

# Stop frontend
# (Ctrl+C w terminalu gdzie działa frontend)

# Stop PostgreSQL
docker stop postgres-dluznik

# Start znowu
docker start postgres-dluznik
npm run dev              # Backend
cd client && npm run dev # Frontend
```

---

## 🐛 Troubleshooting

### Port 3000 już zajęty?
```powershell
# Zmień PORT w .env na 3001
PORT=3001
```

### Port 5174 już zajęty?
```powershell
# Vite wybierze następny port automatycznie
# Sprawdzaj logi frontend'u
```

### Baza danych nie odpowiada?
```powershell
# Sprawdzaj czy PostgreSQL działa
docker ps | Select-String postgres

# Jeśli nie, startuj
docker start postgres-dluznik
```

### Brak danych w bazie?
```powershell
# Migracje się uruchamiają automatycznie
# Zarejestuj nowego użytkownika by dodać dane
```

---

## 📝 Logi

### Backend Logs
Sprawdzaj terminal gdzie działa `npm run dev`

**Powinno być:**
```
✓ Database migrations completed
✓ Database initialization successful
✓ Server is running on port 3000
```

### Frontend Logs
Sprawdzaj terminal gdzie działa `cd client && npm run dev`

**Powinno być:**
```
VITE v8.0.14 ready in XXX ms
Local:   http://localhost:5174/
```

---

## ✨ Features do Testowania

### 1. Auth UX Improvements
- [ ] Show/hide password toggle
- [ ] Email typo detection
- [ ] Password strength meter
- [ ] Remember me checkbox
- [ ] Better error messages

### 2. Loan Management
- [ ] Create loan
- [ ] Edit loan
- [ ] Delete loan
- [ ] View loan details
- [ ] Track payments

### 3. Dashboard
- [ ] Total debt view
- [ ] Interest breakdown
- [ ] Payment forecast
- [ ] Health score
- [ ] Transaction history

### 4. Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile

---

## 🎯 Następne Kroki

### Jutro - Production Deploy na Render
```
https://dashboard.render.com
(patrz RENDER_QUICK_START.md)
```

### Testuj Lokalnie Teraz
```
http://localhost:5174
Testuj wszystkie funkcjonalności
```

---

## 💾 Backup Danych Lokalnych

Jeśli chcesz backup lokalnej bazy przed deploym:

```powershell
# Zrób dump bazy
pg_dump -h localhost -U postgres -d debt_management_app > backup.sql

# Restore (jeśli trzeba)
psql -h localhost -U postgres -d debt_management_app < backup.sql
```

---

## 🚀 Gotowe!

Aplikacja jest w **FULL PRODUCTION MODE** lokalnie! 🎉

```
✅ Backend running on :3000
✅ Frontend running on :5174
✅ PostgreSQL running on :5432
✅ Database fully initialized
✅ All features available
✅ Ready for testing
```

Testuj, a jutro deploy na Render! 💪

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Status:** ✅ RUNNING LOCALLY

🎉 **Aplikacja żyje lokalnie!** 🎉

