# 🚀 Deployment Guide - Aplikacja Dłużnik

## 📋 Spis Treści

1. [Quick Start](#quick-start-3-kroki)
2. [Deployment Options](#deployment-options)
3. [Heroku Deploy](#heroku-deploy)
4. [Railway Deploy](#railway-deploy)
5. [Docker Deploy](#docker-deploy)
6. [VPS Deploy](#vps-deploy)
7. [Production Checklist](#production-checklist)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (3 Kroki)

### Opcja 1: Heroku (Najłatwiej)

```bash
# 1. Zainstaluj Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Zaloguj się
heroku login

# 3. Deploy aplikacji
heroku create your-app-name
git push heroku main

# 4. Ustaw zmienne środowiskowe
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# 5. Sprawdź czy działa
heroku open
```

### Opcja 2: Railway (Modern, Darmowe kredyty)

```bash
# 1. Zainstaluj Railway CLI
# https://railway.app/dashboard

# 2. Zaloguj się
railway login

# 3. Zainicjuj projekt
railway init

# 4. Deploy
railway up

# 5. Ustaw zmienne
railway variables
```

### Opcja 3: Docker (Wszędzie)

```bash
# 1. Build image
docker build -t dluznik:latest .

# 2. Run container
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-secret \
  dluznik:latest

# 3. Gotowe!
```

---

## 🌍 Deployment Options

### Porównanie Platform

| Platform | Koszt | Setup | Performance | Rekomendacja |
|----------|-------|-------|-------------|------------|
| **Heroku** | $5-50/m | ⭐⭐ Łatwy | ⭐⭐⭐ Dobry | Początkujący |
| **Railway** | $5-50/m | ⭐⭐ Łatwy | ⭐⭐⭐ Dobry | **POLECAM** |
| **Vercel** | $0-20/m | ⭐⭐⭐ Bardzo łatwy | ⭐⭐⭐⭐ Świetny | Frontend only |
| **AWS** | $0-100/m | ⭐ Trudny | ⭐⭐⭐⭐⭐ Najlepszy | Zaawansowany |
| **DigitalOcean** | $5-20/m | ⭐⭐ Łatwy | ⭐⭐⭐ Dobry | VPS |
| **Render** | $0-20/m | ⭐⭐ Łatwy | ⭐⭐⭐ Dobry | Nowoczesny |

---

## 🦸 Heroku Deploy

### Krok 1: Przygotowanie

```bash
# Zainstaluj Heroku CLI
# Windows: choco install heroku-cli
# macOS: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# Zaloguj się
heroku login

# Sprawdź czy Git jest zainstalowany
git --version
```

### Krok 2: Konfiguracja Projektu

```bash
# Sprawdź czy masz Procfile
cat Procfile

# Jeśli nie, stwórz go:
echo "web: node dist/index.js" > Procfile

# Sprawdź package.json
# Upewnij się że masz:
# "build": "tsc"
# "start": "node dist/index.js"
```

### Krok 3: Deploy

```bash
# 1. Zainicjuj Heroku app
heroku create your-app-name

# 2. Dodaj PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Ustaw zmienne środowiskowe
heroku config:set JWT_SECRET=<random-secret>
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# 4. Deploy
git push heroku main

# 5. Sprawdź logi
heroku logs --tail

# 6. Otwórz aplikację
heroku open
```

### Krok 4: Zmienne Środowiskowe

```bash
# Ustaw wszystkie wymagane zmienne
heroku config:set \
  JWT_SECRET=your-super-secret-key \
  NODE_ENV=production \
  PORT=3000 \
  CORS_ORIGIN=your-domain.com \
  LOG_LEVEL=info

# Sprawdź zmienne
heroku config

# Zmieniaj zmienne
heroku config:set KEY=value

# Usuwaj zmienne
heroku config:unset KEY
```

### Krok 5: Baza Danych

```bash
# Heroku automatycznie tworzy zmienną DATABASE_URL
# Możesz ją użyć w aplikacji

# Sprawdź połączenie
heroku pg:info

# Backup bazy
heroku pg:backups:capture

# Restore z backupu
heroku pg:backups:restore
```

### Krok 6: Monitoring

```bash
# Sprawdzaj logi
heroku logs --tail

# Sprawdzaj status
heroku status

# Sprawdzaj performance
heroku logs --source app

# Sprawdzaj dysk
heroku ps:exec
```

---

## 🚂 Railway Deploy

### Krok 1: Setup Railway

```bash
# 1. Idź na https://railway.app
# 2. Zaloguj się przez GitHub
# 3. Stwórz nowy projekt

# Instalacja CLI (opcjonalnie)
npm i -g @railway/cli

# Zaloguj się
railway login
```

### Krok 2: Konfiguracja Projektu

```bash
# Zainicjuj Railway project
railway init

# Wybierz:
# - Node.js
# - TypeScript
# - Express

# Lub link GitHub repo do Railway
```

### Krok 3: Database Setup

```bash
# 1. W Railway dashboard
# 2. Kliknij "Create" → PostgreSQL
# 3. Railway automatycznie ustawia DATABASE_URL
# 4. Aplikacja może ją użyć
```

### Krok 4: Environment Variables

```bash
# W Railway dashboard:
# 1. Przejdź do "Environment"
# 2. Dodaj zmienne:
JWT_SECRET=your-secret-key
NODE_ENV=production
CORS_ORIGIN=your-domain.com

# Railway automatycznie:
# - Builduje projekt
# - Runuje aplikację
# - Zarządza bazą danych
```

### Krok 5: Deploy

```bash
# Option 1: Git push
git push

# Option 2: Przez CLI
railway up

# Railway automatycznie:
# - Detectuje Node.js/TypeScript
# - Runuje: npm install
# - Runuje: npm run build
# - Runuje: npm start
```

### Krok 6: Monitoring

```bash
# W Railway dashboard:
# - Logs (real-time)
# - Metrics (CPU, Memory)
# - Database stats
# - Deployments
```

---

## 🐳 Docker Deploy

### Krok 1: Stwórz Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build TypeScript
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

### Krok 2: Stwórz docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_NAME: debt_management_app
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USERNAME: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: debt_management_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Krok 3: Build i Run

```bash
# Build Docker image
docker build -t dluznik:latest .

# Run container
docker-compose up -d

# Sprawdzaj logi
docker-compose logs -f

# Stop container
docker-compose down
```

### Krok 4: Deploy na Docker Hub

```bash
# Login na Docker Hub
docker login

# Tag image
docker tag dluznik:latest username/dluznik:latest

# Push na Docker Hub
docker push username/dluznik:latest

# Ktoś inny może ściągnąć:
docker pull username/dluznik:latest
```

---

## 🖥️ VPS Deploy (DigitalOcean, Linode, etc.)

### Krok 1: Przygotowanie Serwera

```bash
# SSH na serwer
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm i -g pm2

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### Krok 2: Konfiguracja Bazy Danych

```bash
# Zaloguj się na PostgreSQL
sudo -u postgres psql

# Stwórz bazę danych
CREATE DATABASE debt_management_app;

# Stwórz użytkownika
CREATE USER dluznik WITH PASSWORD 'strong-password';

# Daj uprawnienia
GRANT ALL PRIVILEGES ON DATABASE debt_management_app TO dluznik;

# Wyloguj się
\q
```

### Krok 3: Deploy Aplikacji

```bash
# Clone repo
git clone https://github.com/your-username/dluznik.git
cd dluznik

# Install dependencies
npm install

# Build
npm run build

# Stwórz .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dluznik
DB_PASSWORD=strong-password
DB_NAME=debt_management_app
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=your-domain.com
EOF

# Start aplikacji z PM2
pm2 start npm --name "dluznik" -- start

# Ustaw PM2 aby startował przy reboot
pm2 startup
pm2 save
```

### Krok 4: Nginx Configuration

```bash
# Stwórz Nginx config
sudo cat > /etc/nginx/sites-available/dluznik << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/dluznik /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Krok 5: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
```

### Krok 6: Monitoring

```bash
# Sprawdzaj procesy PM2
pm2 list
pm2 logs dluznik
pm2 monit

# Sprawdzaj serwer
htop

# Sprawdzaj logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📋 Production Checklist

Przed deployment'em na production, sprawdź:

### Security ✅
- [ ] Zmień JWT_SECRET na losowy, długi klucz
- [ ] Ustaw NODE_ENV=production
- [ ] Włącz HTTPS/SSL
- [ ] Konfiguruj CORS prawidłowo
- [ ] Usuń debug logs z kodu
- [ ] Ustaw rate limiting
- [ ] Konfiguruj firewall
- [ ] Włącz CORS headers
- [ ] Ustaw secure cookies
- [ ] Waliduj input

### Database ✅
- [ ] Backup bazy danych
- [ ] Ustaw hasła bazodanowe
- [ ] Włącz SSL dla bazy
- [ ] Konfiguruj backupy automatyczne
- [ ] Test восстановления z backupu
- [ ] Monitoruj wydajność bazy

### Performance ✅
- [ ] Kompiluj TypeScript (tsc)
- [ ] Usuń dev dependencies
- [ ] Ustaw NODE_ENV=production
- [ ] Włącz compression
- [ ] Konfiguruj caching
- [ ] Monitoruj response time
- [ ] Sprawdzaj memory usage

### Monitoring ✅
- [ ] Ustaw logging
- [ ] Konfiguruj alerts
- [ ] Monitoruj uptime
- [ ] Trackuj errors
- [ ] Monitoruj performance
- [ ] Sprawdzaj disk space

### Frontend ✅
- [ ] Build production bundle: `npm run build` (w client/)
- [ ] Minifikuj assets
- [ ] Włącz compression
- [ ] Konfiguruj cache headers
- [ ] Test na różnych przeglądarkach
- [ ] Test na mobile
- [ ] Sprawdzaj Performance Score

### DNS & Domain ✅
- [ ] Ustaw DNS records
- [ ] Konfiguruj CNAME/A records
- [ ] Test DNS propagation
- [ ] Ustaw MX records (dla email)

### Backup & Recovery ✅
- [ ] Ustaw automatyczne backupy
- [ ] Test recovery procedure
- [ ] Dokumentuj backup process
- [ ] Przechowuj backupy poza serwerem

---

## 🔧 Environment Variables - Checklist

### Development
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
JWT_SECRET=dev-secret
DEBUG=*
```

### Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=<secure-db-host>
DB_SSL=true
JWT_SECRET=<long-random-secret>
CORS_ORIGIN=your-domain.com
LOG_LEVEL=info
```

---

## 📊 Struktura Deployment'u

### Backend (Node.js/Express)
```
┌─────────────────────────┐
│  Frontend (React/Vite)  │
│  (HTML, CSS, JS)        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Nginx (Reverse Proxy)  │
│  (SSL, Cache)           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Node.js App            │
│  (Express, Business)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  (Persistence)          │
└─────────────────────────┘
```

---

## 🐛 Troubleshooting

### Aplikacja nie startuje

```bash
# 1. Sprawdzaj logi
heroku logs --tail
railway logs
pm2 logs dluznik

# 2. Sprawdzaj zmienne
heroku config
railway variables

# 3. Sprawdzaj że build się udał
npm run build

# 4. Test locally
npm run dev
```

### Database connection failed

```bash
# 1. Sprawdzaj DATABASE_URL
echo $DATABASE_URL

# 2. Test połączenia
psql $DATABASE_URL

# 3. Sprawdzaj credentials
# DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME

# 4. Ping host
ping your-db-host
```

### CORS errors

```bash
# 1. Sprawdzaj CORS_ORIGIN
# Musi zawierać Twój frontend domain

# 2. Sprawdzaj headers
# Access-Control-Allow-Origin powinien być ustawiony

# 3. Test z curl
curl -H "Origin: your-domain.com" http://your-api.com/health
```

### Memory leak

```bash
# 1. Monitoruj memory
heroku ps
top
pm2 monit

# 2. Sprawdzaj logi
grep -i "memory" logs

# 3. Restart aplikacji
heroku restart
pm2 restart dluznik
```

### SSL certificate issues

```bash
# 1. Test SSL
openssl s_client -connect your-domain.com:443

# 2. Check certificate
sudo certbot certificates

# 3. Renew certificate
sudo certbot renew

# 4. Check expiration
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📱 Frontend Deployment (Bonus)

### Deploy Frontend na Vercel

```bash
# 1. Zainstaluj Vercel CLI
npm i -g vercel

# 2. Deploy
cd client
vercel

# 3. Skonfiguruj CORS
# W backend ustaw CORS_ORIGIN=your-vercel-domain.vercel.app
```

### Deploy Frontend na GitHub Pages

```bash
# 1. Build
cd client
npm run build

# 2. Deploy
# Skopiuj zawartość dist/ na GitHub Pages

# 3. Skonfiguruj GitHub
# Settings → Pages → Source: /dist folder
```

---

## 🎯 Kroki Deployment'u - Streszczenie

### 1. Przygotowanie (10 min)
- [ ] Sprawdź package.json
- [ ] Sprawdź .env variables
- [ ] Build lokalnie: `npm run build`
- [ ] Test: `npm start`

### 2. Wybór Platformy (5 min)
- [ ] Railway (POLECAM - najłatwiej)
- [ ] Heroku
- [ ] VPS
- [ ] Docker

### 3. Deploy (15-30 min)
- [ ] Zaloguj się na platformę
- [ ] Stwórz aplikację
- [ ] Ustaw zmienne
- [ ] Deploy kod
- [ ] Konfiguruj bazę danych

### 4. Verification (10 min)
- [ ] Test aplikacji
- [ ] Sprawdzaj logi
- [ ] Konfiguruj DNS

### 5. Monitoring (5 min)
- [ ] Ustaw alerts
- [ ] Monitoruj performance
- [ ] Sprawdzaj logi

**Total Time: ~1 godzina**

---

## 🚀 Rekomendacje

### Dla Początkujących
1. **Railway** - Najprostszy, intuicyjny UI
2. **Vercel** (Frontend) + **Railway** (Backend)
3. **Heroku** - Jeśli znasz Heroku

### Dla Zaawansowanych
1. **AWS** - Skalowalna, potężna
2. **DigitalOcean** - Dobre value for money
3. **VPS + Docker** - Pełna kontrola

### Moja Rekomendacja
**Railway** jest najlepszy dla tej aplikacji, ponieważ:
- ✅ Bardzo łatwy setup
- ✅ Integracja PostgreSQL
- ✅ Darmowe kredyty na początek
- ✅ Nowoczesny interfejs
- ✅ Dobra dokumentacja

---

## 📞 Dodatkowe Zasoby

### Dokumentacja
- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [DigitalOcean Guides](https://www.digitalocean.com/community)
- [Docker Docs](https://docs.docker.com)

### Tools
- [Railway CLI](https://docs.railway.app/cli)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [PM2](https://pm2.keymetrics.io)
- [Let's Encrypt](https://letsencrypt.org)

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Status:** ✅ Gotowy do deployment'u

🚀 **Powodzenia z deployment'em!** 🚀
