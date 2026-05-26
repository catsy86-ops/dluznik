# ⚡ Render Deploy - 15 Minut Instrukcja

## 🎯 TL;DR - Kroki

```
1. https://dashboard.render.com → Sign Up (GitHub)
2. New → PostgreSQL (Free tier)
3. New → Web Service (catsy86-ops/dluznik repo)
4. Add Variables (NODE_ENV, DATABASE_URL, JWT_SECRET)
5. Czekaj 5 minut
6. ✅ Działa!
```

---

## 📋 Krok po Kroku

### 1️⃣ Konto Render (2 min)

```
https://dashboard.render.com
↓
Sign up → GitHub
↓
✅ Jesteś logged in
```

---

### 2️⃣ PostgreSQL Baza (3 min)

**W Dashboard:**
- Kliknij **New +** → **PostgreSQL**

**Ustawienia:**
```
Name:              dluznik-db
Database Name:     debt_management_app
User:              postgres
Region:            Frankfurt (Europe)
Plan:              Free
```

- Kliknij **Create Database**
- Czekaj 1 minutę
- **Skopiuj** `External Database URL` (będzie ti trzeba!)

---

### 3️⃣ Backend (Web Service) (5 min)

**W Dashboard:**
- Kliknij **New +** → **Web Service**
- **Connect account** → GitHub (jeśli trzeba)
- Wybierz repo: **catsy86-ops/dluznik**

**Ustawienia:**
```
Name:              dluznik-backend
Environment:       Docker
Region:            Frankfurt (Europe)
Branch:            main
Dockerfile Path:   ./Dockerfile
Start Command:     node dist/index.js
Plan:              Free
```

- Kliknij **Create Web Service**
- Status: 🔵 Building → 🔵 Deploying → 🟢 Live (czekaj ~5 min)

---

### 4️⃣ Environment Variables (3 min)

**W Render → Web Service:**
- Kliknij **Environment** tab

**Dodaj zmienne:**

```
NODE_ENV                production
PORT                    3000
DATABASE_URL            postgresql://postgres:xxx@yyy.render.com:5432/debt_management_app
JWT_SECRET              GENERATE_PONIŻEJ
CORS_ORIGIN             https://dluznik-backend.onrender.com
```

**Generuj JWT_SECRET** (PowerShell):
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

- Skopiuj rezultat do `JWT_SECRET`
- Kliknij **Save Changes**
- Render zredeploy'uje (~2 min)

---

### 5️⃣ Test (2 min)

**Gdy status będzie 🟢 Live:**

```powershell
# Health check
curl https://dluznik-backend.onrender.com/health

# Lub otwórz w przeglądarce
https://dluznik-backend.onrender.com
```

**Powinno być:**
- ✅ Login page załaduje się
- ✅ Możesz się zarejestrować
- ✅ Możesz się zalogować

---

## 🚨 Jeśli Coś Nie Działa

### Status: FAILED ❌

1. Kliknij na Web Service
2. Przejdź do **Logs** tab
3. Szukaj `ERROR` w logach
4. Kliknij **Redeploy** przycisk

### Baza nie odpowiada

1. Sprawdzaj czy PostgreSQL status to 🟢 Available
2. Sprawdzaj czy DATABASE_URL w zmiennych jest poprawny
3. Czekaj 2-3 minuty na połączenie

### Deploy ciągle trwa

- Normalnie ~5 minut na pierwszy build
- Następne deploye są szybsze (cache)

---

## 📊 Checklist

- [ ] Konto Render (GitHub login)
- [ ] PostgreSQL baza utworzona
- [ ] Web Service utworzony
- [ ] Zmienne ustawione
- [ ] Status = 🟢 Live
- [ ] Health check OK
- [ ] Login page działa

---

## 🎉 Gotowe!

```
🚀 Aplikacja żyje na: https://dluznik-backend.onrender.com
✅ Baza danych dostępna
✅ Auto-deploy na git push
✅ HTTPS (free SSL)
```

Każde `git push origin main` = automatic deploy! 🚀

---

## 📖 Pełna dokumentacja

Jeśli coś wymaga szczegółów:
→ `PRODUCTION_DEPLOY_RENDER.md`

## 💡 Pytania?

Troubleshooting w `PRODUCTION_DEPLOY_RENDER.md` sekcja "🚨 Troubleshooting"

