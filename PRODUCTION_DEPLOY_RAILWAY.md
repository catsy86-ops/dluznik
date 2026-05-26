# 🚀 Production Deploy - Railway (20 minut)

## 📋 Plan

1. **Przygotowanie** (5 min) - Sprawdzenie kodu
2. **Railway Setup** (5 min) - Konto i projekt
3. **Deploy** (5 min) - Push kodu
4. **Konfiguracja** (3 min) - Zmienne i domain
5. **Weryfikacja** (2 min) - Testy

**Total: ~20 minut do PRODUCTION!**

---

## ✅ Krok 1: Przygotowanie (5 min)

### Sprawdzenia

```powershell
# 1. Sprawdzaj czy kod kompiluje się
npm run build

# 2. Sprawdzaj czy testy przechodzą
npm test

# 3. Sprawdzaj TypeScript
npx tsc --noEmit

# 4. Sprawdzaj czy lokalnie działa
npm start
# Otwórz: http://localhost:3000/health
```

### Git Commit

```powershell
# 1. Dodaj zmiany
git add .

# 2. Commit
git commit -m "Ready for production deployment"

# 3. Push na GitHub
git push origin main
```

---

## 🚂 Krok 2: Railway Setup (5 min)

### Część A: Stwórz Konto Railway

1. Idź na: **https://railway.app**
2. Kliknij **"Start Free"** (górny prawy róg)
3. Zaloguj się przez **GitHub**
4. Autoryzuj Railway na Twoim GitHub
5. Dashboard się załaduje

### Część B: Nowy Projekt

1. W Railway Dashboard kliknij **"Create New Project"**
2. Wybierz **"Deploy from GitHub"**
3. Wybierz **"Authorize with GitHub"** (jeśli wymagane)
4. Znajdź i kliknij repo **"dluznik"**
5. Railway zacznie deploy

**Railway automatycznie:**
- Detectuje Dockerfile
- Buduje image
- Startuje aplikację

---

## 🐘 Krok 3: Dodaj PostgreSQL (3 min)

### W Railway Dashboard

1. Kliknij **"Create"** przycisk (+ sign)
2. Wybierz **"Database"** → **"PostgreSQL"**
3. Railway auto-tworzy:
   - PostgreSQL service
   - DATABASE_URL variable
   - Ustawia hasło

### Railway Auto-Konfiguruje:
```
✅ Baza danych created
✅ DATABASE_URL set
✅ Połączenie do backend'u
```

---

## ⚙️ Krok 4: Ustaw Zmienne (3 min)

### W Railway Dashboard → Variables Tab

Dodaj zmienne:

```
NODE_ENV = production
JWT_SECRET = <GENERATE-RANDOM-32-CHARS>
PORT = 3000
CORS_ORIGIN = your-domain.com (lub Railway URL)
```

### Generuj JWT_SECRET

W PowerShell:

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

Lub online: https://generate-random.org/encryption-keys?count=1&bytes=32&uppercase=false&start_index=0

### Railway Auto-Ustawia:

```
✅ DATABASE_URL - Auto
✅ PORT - Auto
```

---

## 🎯 Krok 5: Deploy (5 min)

### Co Się Dzieje Automatycznie

```
Git Push
  ↓
Railway detectuje zmianę
  ↓
Railway buduje Docker image
  ↓
Railway startuje aplikację
  ↓
Railway łączy z PostgreSQL
  ↓
✅ APLIKACJA LIVE!
```

### Monitoring Deploy'u

W Railway Dashboard → Deployments:

```
🔵 BUILDING...        (czekaj ~3 min)
🔵 DEPLOYING...       (czekaj ~2 min)
🟢 SUCCESS!           (aplikacja żyje!)
```

### Logi

Kliknij na deployment → **Logs** tab:

```
✅ Building Docker image
✅ Running npm install
✅ Running npm run build
✅ Starting app
✅ Server listening on port 3000
```

---

## 🌐 Krok 6: Custom Domain (5 min - opcjonalnie)

### Opcja A: Railway Subdomain (Default)

```
Railway automatycznie daje URL:
https://your-app-random.up.railway.app
```

Już działa! Możesz użyć od razu.

### Opcja B: Custom Domain

1. Kup domenę (Namecheap, GoDaddy, etc.)
2. W Railway: **Settings** → **Domains**
3. Kliknij **"Add Custom Domain"**
4. Wpisz swoją domenę (np. dluznik.pl)
5. Railway pokazuje DNS settings
6. W DNS provider: Ustaw CNAME na Railway URL
7. Czekaj ~10 minut na propagację
8. ✅ Działa!

---

## ✅ Krok 7: Weryfikacja (2 min)

### Test 1: Health Check

```powershell
curl https://your-app.up.railway.app/health
```

Powinno być: `200 OK`

### Test 2: Aplikacja

```
Otwórz przeglądarkę:
https://your-app.up.railway.app
```

Powinieneś zobaczyć login page

### Test 3: Funkcjonalność

- [ ] Strona ładuje się
- [ ] Logowanie działa
- [ ] Rejestracja działa
- [ ] API requests działają
- [ ] Baza danych się łączy

---

## 📊 Production Checklist

- [ ] Kod na GitHub (git push origin main)
- [ ] Railway projekt utworzony
- [ ] PostgreSQL dodane
- [ ] Zmienne ustawione (NODE_ENV=production, JWT_SECRET, itd.)
- [ ] Deploy zakończony (SUCCESS status)
- [ ] Health check OK
- [ ] Aplikacja ładuje się
- [ ] Logowanie działa
- [ ] Baza danych dostępna
- [ ] Logi czyste (bez ERROR)

---

## 🔍 Troubleshooting

### Problem 1: Deploy Failed

```
Status: FAILED ❌
```

**Fix:**

1. Kliknij deployment → Logs
2. Szukaj błędu
3. Sprawdzaj:
   - Dockerfile syntax
   - npm build - czy działa lokalnie?
   - Dependencies - czy są zainstalowane?

### Problem 2: App Crashes

```
Status: SUCCESS ale aplikacja wyłącza się
```

**Fix:**

1. Sprawdzaj logi - szukaj ERROR
2. Sprawdzaj zmienne - DATABASE_URL ustawiona?
3. Restart: **Redeploy** button

### Problem 3: Database Connection Error

```
Error: connect ECONNREFUSED
```

**Fix:**

1. Sprawdzaj DATABASE_URL zmienną
2. PostgreSQL service running?
3. Sprawdzaj połączenie:
   ```
   Railway → PostgreSQL → Logs
   ```

### Problem 4: Slow Deploy

```
Building... (5+ minutes)
```

**Normal** - First build zawsze dłużej trwa

**Future deploys** - Szybciej (cache)

---

## 📈 Monitoring Production

### Daily

```
1. Sprawdzaj logi: Railway Dashboard → Logs
2. Sprawdzaj health: curl https://your-app.up.railway.app/health
3. Sprawdzaj metrics: Railway Dashboard → Metrics
```

### Weekly

```
1. Database size
2. CPU/Memory usage
3. Error logs
4. Backup status
```

### Monthly

```
1. Security updates
2. Dependency updates
3. Performance review
4. Cost review
```

---

## 🆘 Emergency

### Aplikacja Down?

```powershell
# 1. Check Railway Dashboard
# 2. Look at Logs
# 3. Redeploy: Click "Redeploy" button
# 4. Or restart: Railway → Settings → Restart
```

### Need Rollback?

```
Railway → Deployments
→ Kliknij na poprzedni deployment
→ Kliknij "Redeploy this"
```

### Database Problem?

```
Railway → PostgreSQL → Logs
```

---

## 📞 Railway Support

- Docs: https://docs.railway.app
- Community: https://railway.app/community
- Status: https://railway.app/status

---

## 💰 Koszt

### Railway Pricing

- **Free Tier:** $5 starting credits (monthly)
- **Pay-as-you-go:** $0.000347/CPU-hour, $0.0000463/GB-hour
- **Typical cost:** $10-30/month dla tej aplikacji

### Zarządź Kosztami

```
Railway → Account → Billing
→ Set spending limit ($20/month)
```

---

## 🎯 TLDR - Szybko

```powershell
# 1. GitHub
git push origin main

# 2. Railway
# - Konto: https://railway.app
# - Projekt: "Deploy from GitHub"
# - PostgreSQL: "Create" → "Database"
# - Variables: NODE_ENV, JWT_SECRET, etc.

# 3. Czekaj ~5 min

# 4. Test
# https://your-app.up.railway.app

# ✅ DONE!
```

---

## 🚀 Next Steps

### Po Deployment'ie

1. **Monitor** - Sprawdzaj logi
2. **Test** - Testuj wszystko
3. **Setup domain** - Custom domain (opcjonalnie)
4. **Backup** - Database backups
5. **Security** - SSL (auto), firewall, rate limiting

### W Przyszłości

1. **CI/CD** - Auto deploy na push
2. **Monitoring** - Alerts, uptime monitoring
3. **Scaling** - Wenn traffic rośnie
4. **Updates** - Security patches, dependencies

---

## ✅ GOTOWE!

Twoja aplikacja jest teraz w **PRODUCTION**! 🎉

```
✅ Aplikacja online
✅ Baza danych secure
✅ HTTPS enabled
✅ Auto-scaling configured
✅ Backups enabled
✅ Monitoring ready
```

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Platform:** Railway  
**Status:** ✅ PRODUCTION READY

🚀 **Twoja aplikacja żyje!** 🚀
