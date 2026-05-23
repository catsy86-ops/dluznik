# 🚀 DEPLOYMENT GUIDE - Dłużnik App

## Opcje Deploymentu

| Platforma | Koszt | Trudność | Czas |
|-----------|-------|----------|------|
| **Railway** | Darmowy (500h/mies) | ⭐ Łatwy | 15 min |
| **Render** | Darmowy (z ograniczeniami) | ⭐ Łatwy | 20 min |
| **Fly.io** | Darmowy tier | ⭐⭐ Średni | 30 min |
| **VPS (DigitalOcean)** | ~$6/mies | ⭐⭐⭐ Trudny | 1h |

---

## 🏆 OPCJA 1: Railway (POLECANA)

### Krok 1: Wrzuć kod na GitHub

```bash
# W folderze projektu (C:\Users\catsy\OneDrive\Pulpit\Dluznik)
git init
git add .
git commit -m "Initial commit"

# Stwórz repo na github.com, potem:
git remote add origin https://github.com/TWOJ_USERNAME/dluznik.git
git push -u origin main
```

### Krok 2: Zaloguj się na Railway

1. Wejdź na **railway.app**
2. Kliknij **"Start a New Project"**
3. Wybierz **"Deploy from GitHub repo"**
4. Wybierz swoje repo `dluznik`

### Krok 3: Dodaj PostgreSQL

1. W projekcie kliknij **"+ New"**
2. Wybierz **"Database" → "PostgreSQL"**
3. Railway automatycznie doda `DATABASE_URL` do zmiennych środowiskowych

### Krok 4: Ustaw zmienne środowiskowe

W Railway → Twój serwis → **Variables**, dodaj:

```
NODE_ENV=production
JWT_SECRET=WYGENERUJ_LOSOWY_KLUCZ_64_ZNAKI
```

Aby wygenerować JWT_SECRET, uruchom w terminalu:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Krok 5: Deploy!

Railway automatycznie:
- Wykryje Dockerfile
- Zbuduje aplikację
- Uruchomi migracje bazy danych
- Udostępni URL (np. `https://dluznik-production.up.railway.app`)

---

## 🟢 OPCJA 2: Render

### Krok 1: GitHub (tak samo jak Railway)

### Krok 2: Render Setup

1. Wejdź na **render.com**
2. **"New" → "Web Service"**
3. Połącz GitHub repo
4. Ustaw:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`

### Krok 3: Baza danych

1. **"New" → "PostgreSQL"**
2. Skopiuj **Internal Database URL**
3. Dodaj jako zmienną `DATABASE_URL` w Web Service

### Krok 4: Zmienne środowiskowe

```
NODE_ENV=production
DATABASE_URL=<skopiowany z Render PostgreSQL>
JWT_SECRET=<losowy klucz>
```

---

## 🔵 OPCJA 3: Fly.io

### Instalacja CLI

```bash
# Windows (PowerShell jako admin)
iwr https://fly.io/install.ps1 -useb | iex
```

### Deploy

```bash
# W folderze projektu
fly auth login
fly launch --name dluznik-app
fly postgres create --name dluznik-db
fly postgres attach dluznik-db
fly secrets set JWT_SECRET="twoj_losowy_klucz"
fly deploy
```

---

## 🖥️ OPCJA 4: VPS (DigitalOcean/Hetzner)

### Krok 1: Kup VPS

- DigitalOcean Droplet: $6/mies (1GB RAM)
- Hetzner CX11: €3.29/mies (2GB RAM) ← LEPSZY WYBÓR

### Krok 2: Zainstaluj Docker

```bash
# SSH do serwera
ssh root@TWOJ_IP

# Instalacja Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y
```

### Krok 3: Skopiuj pliki

```bash
# Na lokalnym komputerze
scp -r . root@TWOJ_IP:/app/dluznik
```

### Krok 4: Uruchom z docker-compose

```bash
# Na serwerze
cd /app/dluznik
cp .env.production.example .env
nano .env  # Edytuj zmienne

docker-compose up -d
```

---

## 📦 DOCKER COMPOSE (dla VPS)

Stwórz `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/debt_management_app
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=debt_management_app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

Uruchomienie:
```bash
echo "DB_PASSWORD=silne_haslo_123" > .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env
docker-compose up -d
```

---

## 🔒 BEZPIECZEŃSTWO PRZED DEPLOYMENTEM

### Obowiązkowe:

1. **Zmień JWT_SECRET** na losowy 64-znakowy string
2. **Zmień hasło bazy danych** na silne
3. **Ustaw NODE_ENV=production**
4. **Nie commituj .env** (jest w .gitignore ✅)

### Opcjonalne ale zalecane:

5. Dodaj domenę z SSL (Railway/Render robią to automatycznie)
6. Ustaw rate limiting (już jest w middleware)
7. Skonfiguruj backup bazy danych

---

## 🌐 WŁASNA DOMENA

### Railway:
1. Settings → Domains → "Add Custom Domain"
2. Dodaj rekord CNAME w DNS swojej domeny

### Render:
1. Settings → Custom Domains
2. Dodaj rekord CNAME

---

## 📊 MONITORING

### Darmowe opcje:
- **UptimeRobot** - monitoring dostępności (darmowy)
- **Railway Metrics** - wbudowane w Railway
- **Render Logs** - wbudowane w Render

---

## 🔄 AKTUALIZACJE

Po każdej zmianie kodu:

```bash
git add .
git commit -m "Update: opis zmian"
git push origin main
```

Railway/Render automatycznie wykryją push i zdeployują nową wersję!

---

## ✅ CHECKLIST PRZED DEPLOYMENTEM

- [ ] `git init` i pierwsze `git commit`
- [ ] Repo na GitHub
- [ ] Konto na Railway/Render
- [ ] Wygenerowany JWT_SECRET
- [ ] Zmienne środowiskowe ustawione
- [ ] Baza danych skonfigurowana
- [ ] Test lokalny: `npm run build` działa
- [ ] Test lokalny: `cd client && npm run build` działa

---

## 🆘 TROUBLESHOOTING

### "Application failed to start"
- Sprawdź logi w Railway/Render
- Upewnij się że `DATABASE_URL` jest ustawiony
- Sprawdź czy `JWT_SECRET` jest ustawiony

### "Database connection refused"
- Upewnij się że baza danych jest w tym samym projekcie
- Sprawdź `DATABASE_URL` format

### "Build failed"
- Sprawdź czy `npm run build` działa lokalnie
- Sprawdź logi buildu

### Frontend nie ładuje się
- Sprawdź czy `client/dist` jest generowany
- Sprawdź Dockerfile - czy kopiuje `client/dist` do `public`

---

## 📞 SZYBKI START (Railway - 15 minut)

```bash
# 1. GitHub
git init && git add . && git commit -m "Deploy"
# Stwórz repo na github.com
git remote add origin https://github.com/USERNAME/dluznik.git
git push -u origin main

# 2. Railway
# - Wejdź na railway.app
# - New Project → Deploy from GitHub
# - Wybierz repo
# - Add PostgreSQL database
# - Set JWT_SECRET variable
# - Deploy!
```

**Gotowe! Twoja aplikacja będzie dostępna pod adresem Railway!** 🎉
