# 🚂 Railway Quick Deploy - 10 Minut

## ⚡ TL;DR - Najszybciej Możliwe

### Krok 1: Przygotuj Kod (2 min)

```bash
# Sprawdź czy kompiluje się
npm run build

# Sprawdź czy startuje lokalnie
npm start

# Git commit
git add .
git commit -m "Ready for deployment"
```

### Krok 2: Stwórz Railway Project (3 min)

1. Idź na https://railway.app
2. Kliknij "Create New Project"
3. Wybierz "Deploy from GitHub"
4. Zaloguj się GitHub
5. Wybranie repo

### Krok 3: Dodaj Database (2 min)

1. W Railway dashboard
2. Kliknij "Create" przycisk
3. Wybierz "PostgreSQL"
4. Railway auto-konfiguruje połączenie

### Krok 4: Ustaw Zmienne (2 min)

```bash
# W Railway → Variables

JWT_SECRET=your-super-secret-random-key
NODE_ENV=production
PORT=3000
CORS_ORIGIN=your-domain.com
```

### Krok 5: Deploy (1 min)

```bash
# Automatycznie po Git push:
git push origin main

# Railway:
# 1. Detectuje Node.js
# 2. Runuje: npm install
# 3. Runuje: npm run build
# 4. Runuje: npm start
# 5. Publikuje aplikację
```

### ✅ GOTOWE! (10 minut)

Twoja aplikacja działa na:
```
https://your-app-name.up.railway.app
```

---

## 📋 Szczegółowy Step-by-Step

### Step 1: GitHub Setup

```bash
# Upewnij się że masz Git repo
git init
git add .
git commit -m "Initial commit"

# Połącz z GitHub (jeśli nie masz)
git remote add origin https://github.com/your-username/dluznik.git
git branch -M main
git push -u origin main
```

### Step 2: Railway Account

1. Idź na https://railway.app
2. "Sign in with GitHub" (lub "Continue with GitHub")
3. Zaloguj GitHub jeśli wymagane
4. Railway się zaloguje na Twoim koncie

### Step 3: Create Project

```
Railway Dashboard
  ↓
"Create New Project" (przycisk)
  ↓
"Deploy from GitHub"
  ↓
Wybierz repo "dluznik"
  ↓
"Deploy"
```

Railway automatycznie:
- Detectuje Node.js (z package.json)
- Runuje build
- Startuje aplikację

### Step 4: Add Database

```
Railway Dashboard → Your Project
  ↓
"Create" przycisk (+ sign)
  ↓
"PostgreSQL"
  ↓
Railway tworzy bazę danych
  ↓
Auto-ustawia DATABASE_URL zmienną
```

### Step 5: Environment Variables

```
Railway Dashboard → Your Project → Variables
  ↓
Dodaj zmienne:

JWT_SECRET: <random-secret-here>
NODE_ENV: production
PORT: 3000
CORS_ORIGIN: your-domain.com
LOG_LEVEL: info
```

### Step 6: Verify Deployment

```
Railway Dashboard → Your Project → Deployments
  ↓
Powinieneś zobaczyć: "DEPLOYING..." → "SUCCESS"
  ↓
Kliknij na "Visit" przycisk
  ↓
Albo idź na: https://your-project.up.railway.app
```

---

## 🔗 Łączenie Domeny

### Custom Domain

```
Railway Dashboard → Your Project → Settings
  ↓
"Custom Domain"
  ↓
Wpisz: your-domain.com
  ↓
Railway pokazuje DNS settings
  ↓
W Twoim DNS provider:
  1. Dodaj CNAME: your-domain.com → your-project.up.railway.app
  2. Lub A record
  ↓
Czekaj ~10 minut na propagację
```

---

## 🐛 Troubleshooting Railway

### Aplikacja nie startuje?

```
1. Sprawdzaj Logs:
   Railway Dashboard → Logs (tab)
   
2. Szukaj błędu (najczęstsze):
   - Cannot find module (brakuje dependency)
   - Connection refused (baza danych nie połączna)
   - Port already in use (port zajęty)

3. Fix:
   npm install (brakujące dependency)
   Sprawdzaj zmienne (DATABASE_URL)
   Railway auto-restartuje po Fix
```

### Błędy bazy danych?

```
1. Sprawdzaj czy PostgreSQL running:
   Railway Dashboard → Services → PostgreSQL → Status

2. Sprawdzaj CONNECTION STRING:
   Railway auto-ustawia DATABASE_URL
   Aplikacja powinna ją użyć automatycznie

3. Sprawdzaj credentials:
   postgresql://user:password@host:5432/database

4. Test connection:
   psql <DATABASE_URL>
```

### CORS errors?

```
1. Sprawdzaj CORS_ORIGIN zmienna:
   Musi być ustawiona na Twój frontend domain

2. W aplikacji jest obsługa CORS?
   Backend musi mieć cors middleware

3. Frontend domain match?
   https://frontend.com !== https://www.frontend.com
   (musisz czasem dodać obie wersje)
```

### Slow responses?

```
1. Sprawdzaj:
   Railway Dashboard → Metrics
   - CPU usage
   - Memory usage
   - Response time

2. Optimize:
   - Dodaj indexy w bazie
   - Caching
   - Lazy loading

3. Scale up:
   Railway → Redeploy (wyższa instancja)
```

---

## 📈 Monitoring Railway

### Logs

```
Railway Dashboard → Project → Logs (tab)

Najczęstsze logs:
- "Application started" ✅ (OK)
- "Error connecting to DB" ❌ (problem)
- "Port 3000 in use" ❌ (problem)
```

### Metrics

```
Railway Dashboard → Project → Metrics

Obserwuj:
- CPU Usage (powinno być < 50%)
- Memory (powinno być < 500MB)
- Network (request count)
```

### Deployments

```
Railway Dashboard → Project → Deployments

Historia wdrożeń:
- SUCCESS ✅ (aplikacja działa)
- RUNNING 🔵 (wdrażanie w toku)
- FAILED ❌ (coś poszło nie tak)

Kliknij aby zobaczyć szczegóły
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

```bash
NIGDY nie wpisuj w kod:
❌ JWT_SECRET="my-secret"
❌ DB_PASSWORD="password123"
❌ API_KEYS="key123"

ZAWSZE używaj zmiennych:
✅ JWT_SECRET=<set in Railway>
✅ DB_PASSWORD=<set in Railway>
```

### 2. Secrets Management

```
Railway Dashboard → Variables

Sensitive data:
- JWT_SECRET (długi, losowy)
- DB_PASSWORD (strong password)
- API_KEYS (external services)

Railway je szyfruje automatycznie ✅
```

### 3. HTTPS

```
Railway automatycznie:
- Generuje SSL certificate
- Redirectuje HTTP → HTTPS
- Odnawia certificate automatycznie

Twoja aplikacja zawsze na HTTPS ✅
```

### 4. Database Backup

```
Railway PostgreSQL:
- Automatyczne daily backupy
- 7-day retention
- Możesz ręcznie zrobić backup

Backup workflow:
Railway Dashboard → PostgreSQL → Backups
```

---

## 💰 Pricing Railway

### Free Tier
- $5 starter credits/month
- Wystarczy na dev/testing
- No billing required

### Paid (Pay-as-you-go)
- $5-100+/month w zależności od użycia
- CPU, Memory, Database usage

### Przykład kosztów
- Simple Node.js app: $5-10/month
- + PostgreSQL: $5-15/month
- Total: ~$10-25/month

---

## 📊 Deployment Stages

```
Development
  ├─ npm run dev (local)
  └─ Git commit

Staging (Optional)
  ├─ Different Railway project
  └─ Full testing

Production
  ├─ Railway project
  └─ Custom domain
  └─ Full monitoring
```

---

## ✅ Post-Deployment Checklist

- [ ] Aplikacja startuje ✅
- [ ] Logs bez errors ✅
- [ ] Database connection OK ✅
- [ ] Frontend loguje się ✅
- [ ] Requests do API working ✅
- [ ] Database operacje OK ✅
- [ ] Metrics healthy ✅
- [ ] Backup skonfigurowany ✅
- [ ] Custom domain working ✅
- [ ] HTTPS working ✅

---

## 🎯 Co Dalej?

### Po Deployment'ie

1. **Monitoring**
   - Sprawdzaj logi
   - Obserwuj metrics
   - Setup alerts

2. **Backups**
   - Test recovery
   - Dokumentuj process

3. **Optimization**
   - Monitor performance
   - Optimize code
   - Scale if needed

4. **Security**
   - Regular updates
   - Dependency audits
   - Security patches

---

## 📞 Railway Support

- Docs: https://docs.railway.app
- Status: https://railway.app/status
- Community: https://discord.gg/railway
- Email: support@railway.app

---

## 🚀 Summary

```
┌─────────────────────────┐
│  Railway Deployment     │
├─────────────────────────┤
│ ✅ 1. Git Push         │ (instant)
│ ✅ 2. Auto Build       │ (2 min)
│ ✅ 3. Auto Deploy      │ (2 min)
│ ✅ 4. Add PostgreSQL   │ (1 min)
│ ✅ 5. Set Variables    │ (1 min)
│ ✅ 6. Live!            │ (5 min total)
└─────────────────────────┘

Twoja aplikacja jest teraz live! 🎉
```

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Czas:** 10 minut  
**Difficulty:** ⭐ Bardzo łatwe

🚀 **Powodzenia!** 🚀
