# 🚀 Production Deploy - Render.com (15 minut)

## 📋 Plan

1. **Konto Render** (2 min) - Sign up z GitHub
2. **PostgreSQL** (3 min) - Tworzenie bazy
3. **Backend Deploy** (5 min) - Push kodu
4. **Zmienne** (3 min) - Konfiguracja
5. **Test** (2 min) - Weryfikacja

**Total: ~15 minut do PRODUCTION!**

---

## ✅ Krok 1: Utwórz Konto Render (2 min)

### 1. Idź na Render
```
https://dashboard.render.com
```

### 2. Zaloguj się przez GitHub
- Kliknij **"Sign up"**
- Wybierz **"Continue with GitHub"**
- Zatwierdź dostęp dla Render

### 3. Gotowe!
- Dashboard się załaduje
- Jesteś gotowy do deployu

---

## 🐘 Krok 2: Utwórz PostgreSQL (3 min)

### 1. W Render Dashboard
- Kliknij **"New +"** (górny lewy róg)
- Wybierz **"PostgreSQL"**

### 2. Konfiguracja
```
Name:           dluznik-db
Database Name:  debt_management_app
User:           postgres
Region:         Frankfurt (Europe) lub Twoja najbliższa
Plan:           Free (wystarczy do testów)
```

### 3. Utwórz
- Kliknij **"Create Database"**
- Czekaj ~1 minutę

### 4. Skopiuj Connection String
- Gdy baza się tworzy, zobaczysz **"Internal Database URL"** i **"External Database URL"**
- Skopiuj **External Database URL** (będzie coś takiego):
```
postgresql://postgres:PASSWORD@oregon-postgres.render.com:5432/debt_management_app
```

---

## 🎛️ Krok 3: Utwórz Web Service (Backend) (5 min)

### 1. W Render Dashboard
- Kliknij **"New +"**
- Wybierz **"Web Service"**

### 2. Połącz GitHub
- Kliknij **"Connect account"** (jeśli potrzebne)
- Wybierz repo: **catsy86-ops/dluznik**
- Kliknij **"Connect"**

### 3. Konfiguracja
```
Name:                   dluznik-backend
Environment:            Docker
Region:                 Frankfurt (Europe) lub Twoja
Branch:                 main
Dockerfile Path:        ./Dockerfile
Build Command:          (zostaw puste - auto)
Start Command:          node dist/index.js
Plan:                   Free (wystarczy na start)
```

### 4. Advanced Settings (rozwiń)
```
Auto-Deploy:            Yes (deploy na każdy git push)
Health Check Path:      /health
Health Check Protocol:  HTTP
```

### 5. Utwórz
- Kliknij **"Create Web Service"**
- Render zacznie budować image i deployować
- Status będzie: 🔵 **Building...** → 🔵 **Deploying...** → 🟢 **Live!**
- Czekaj ~5 minut

---

## ⚙️ Krok 4: Dodaj Environment Variables (3 min)

### W Render - Web Service Settings

**Kliknij w:** Your Service → **Environment** tab

Dodaj zmienne:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:PASSWORD@...  (skopiuj z kroku 2)
JWT_SECRET=GENERATE_BELOW
CORS_ORIGIN=https://your-app-name.onrender.com
```

### Generuj JWT_SECRET

W PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

Skopiuj rezultat i wklej jako `JWT_SECRET` na Render.

### Zapisz
- Kliknij **"Save Changes"**
- Render automatycznie redeploy'uje aplikację (~2 min)

---

## 🌐 Krok 5: Pobierz URL Aplikacji (1 min)

### W Render Dashboard

Twoja aplikacja będzie dostępna na:

```
https://dluznik-backend.onrender.com
```

(Lub inny losowy subdomain - będzie widoczny w Dashboard)

---

## ✅ Krok 6: Test Aplikacji (2 min)

### Test 1: Health Check

```powershell
curl https://dluznik-backend.onrender.com/health
```

Powinno być: `{"status":"ok"}`

### Test 2: Frontend

Otwórz w przeglądarce:
```
https://dluznik-backend.onrender.com
```

Powinieneś zobaczyć login page

### Test 3: Rejestracja i Login

- [ ] Strona ładuje się bez błędów
- [ ] Możesz się zarejestrować
- [ ] Możesz się zalogować
- [ ] Dashboard się otwiera

---

## 📊 Production Checklist

- [ ] Konto Render utworzone
- [ ] PostgreSQL baza utworzona
- [ ] Web Service (backend) utworzony
- [ ] GitHub połączony
- [ ] Environment variables ustawione (NODE_ENV, DATABASE_URL, JWT_SECRET)
- [ ] Deploy zakończony (🟢 Live status)
- [ ] Health check OK
- [ ] Aplikacja ładuje się
- [ ] Logowanie działa
- [ ] Baza danych dostępna

---

## 🚨 Troubleshooting

### Problem 1: Deploy Failed

```
Status: FAILED ❌
```

**Fix:**

1. Kliknij na Web Service
2. Przejdź do **Logs** tab
3. Szukaj błędu w logach
4. Częste problemy:
   - `npm install` failed → check dependencies
   - Database connection failed → check DATABASE_URL
   - Port not available → check PORT variable

**Redeploy:**
- Kliknij **"Redeploy"** button

### Problem 2: Database Connection Error

```
Error: connect ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

**Fix:**

1. Sprawdź czy PostgreSQL baza działa
   - Render Dashboard → PostgreSQL → Status powinno być 🟢 Available
2. Sprawdź DATABASE_URL
   - Musi zawierać poprawne hasło i host
3. Sprawdzaj logi:
   - Render → Web Service → Logs

### Problem 3: "Cannot find module"

```
Error: Cannot find module 'express'
```

**Fix:**

1. Sprawdzaj Dockerfile - czy `npm install` jest tam
2. Sprawdzaj package.json - czy zależności są tam
3. Redeploy: kliknij **"Redeploy"**

### Problem 4: Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Fix:**

1. Zmień PORT w environment variables
2. Np. `PORT=8080` zamiast `3000`
3. Lub restart: Render → **Settings** → **Restart Instance**

### Problem 5: Deployment Takes Forever

```
Building... (10+ minutes)
```

**Normal na starcie** - Pierwszy build zawsze dłuższy

**Future deployments** - Szybciej (cache)

---

## 🔄 Continuous Deployment

### Auto-Deploy (już ustawiony!)

```
Git Push
  ↓
Render detectuje zmianę
  ↓
Render buduje Docker image
  ↓
Render deployuje aplikację
  ↓
✅ LIVE!
```

Każde `git push origin main` = automatyczny deploy!

---

## 📈 Monitoring Production

### Daily

```
1. Sprawdzaj logi: Render → Logs
2. Sprawdzaj health: curl https://your-app.onrender.com/health
3. Sprawdzaj status: Render Dashboard
```

### Weekly

```
1. Database size
2. Error logs
3. Performance metrics
```

---

## 💾 Backups

Render **nie ma** automatycznych backupów dla Free tier.

**Backup ręczny:**

```powershell
# 1. Pobierz DATABASE_URL z Render
$env:DATABASE_URL = "postgresql://..."

# 2. Zrób dump
pg_dump --file backup.sql $env:DATABASE_URL

# 3. Backup gotowy: backup.sql
```

**Lub** - Zadbaj o backups przed produkcją (to inna opowieść).

---

## 🌐 Custom Domain (Opcjonalnie)

### Jeśli masz swoją domenę

1. Kup domenę (Namecheap, GoDaddy, etc.)
2. Render → Web Service → **Settings** → **Custom Domain**
3. Wpisz domenę: `dluznik.pl`
4. Render da CI certyfikat (automatyczne HTTPS)
5. W DNS provider: Ustaw CNAME na render URL
6. Czekaj ~15 minut na propagację
7. ✅ Działa!

---

## 🎯 Render Free Tier Limity

```
✅ To działa na Free:
- Web Service (dowolna wielkość)
- PostgreSQL (5GB)
- 750 hours/month compute
- Auto-suspend (stop po 15 min bezczynności)

⚠️ Uwaga:
- Auto-suspend - aplikacja wybudzi się na pierwszy request (~30s)
- Bez backupów
- Bez zaawansowanego monitoringu
```

---

## 💰 Koszt

### Free Tier
- Darmowy do 750 godzin/miesiąc
- ~31 dni = 744 godziny
- **Wystarczy na pełny miesiąc** (z auto-suspend)

### Paid (jeśli chcesz zawsze online)
- Web Service: $7/miesiąc (standard, zawsze online)
- PostgreSQL: $15/miesiąc (dedicated)
- **Total: ~$22/miesiąc** (ale free tier wystarczy na początek)

---

## 🚀 TLDR - Szybko

```powershell
# 1. Konto Render
# https://dashboard.render.com
# Sign up z GitHub

# 2. PostgreSQL
# New → Database → PostgreSQL
# Skopiuj DATABASE_URL

# 3. Web Service
# New → Web Service → GitHub repo (catsy86-ops/dluznik)
# Czekaj ~5 minut na build

# 4. Environment Variables
# NODE_ENV=production
# DATABASE_URL=postgresql://...
# JWT_SECRET=GENERATE

# 5. Test
# https://your-app.onrender.com
# ✅ DONE!
```

---

## ✅ Następne Kroki

### Po Deployment'ie

1. **Monitor** - Sprawdzaj logi i status
2. **Test** - Testuj wszystko (rejestracja, login, etc.)
3. **Backup** - Ustaw backup strategię
4. **Custom Domain** - Jeśli chcesz (opcjonalnie)

### W Przyszłości

1. **Paid Plan** - Jeśli Free tier będzie za wolny
2. **CI/CD** - Już masz (auto-deploy na git push!)
3. **Monitoring** - Ustawić Sentry/Datadog
4. **Performance** - Optimize images, cache, CDN

---

## 📞 Render Support

- Docs: https://render.com/docs
- Status: https://status.render.com
- Community: https://render.com/community

---

## 🎉 GOTOWE!

Twoja aplikacja jest teraz w **PRODUCTION** na Render! 🚀

```
✅ Aplikacja online (https://your-app.onrender.com)
✅ Baza danych secure
✅ HTTPS enabled (free SSL)
✅ Auto-deploy na git push
✅ Monitoring ready
```

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Platform:** Render.com  
**Status:** ✅ PRODUCTION READY

🚀 **Twoja aplikacja żyje!** 🚀

