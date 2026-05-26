# 🐳 Docker Fix - Windows PowerShell

## Problem
```bash
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-secret \
  dluznik:latest
```
**NOT WORKING** - Backslash escaping na Windowsie inny!

---

## ✅ ROZWIĄZANIE - 3 Metody

### Metoda 1: docker-compose (POLECAM - najłatwiej)

```bash
# 1. Przejdź do folderu projektu
cd C:\Users\catsy\OneDrive\Pulpit\Dluznik

# 2. Build Docker image
docker build -t dluznik:latest .

# 3. Uruchom docker-compose (all in one!)
docker-compose up -d

# 4. Sprawdzaj logi
docker-compose logs -f app

# 5. Sprawdzaj status
docker-compose ps

# 6. Stop
docker-compose down
```

**Co się stanie:**
- ✅ Builds frontend
- ✅ Builds backend
- ✅ Starts PostgreSQL
- ✅ Starts aplikacja
- ✅ Auto-łączy wszystko
- ✅ Aplikacja na http://localhost:3000

---

### Metoda 2: Backticks (PowerShell)

```powershell
# W PowerShell:
docker run -p 3000:3000 `
  -e DB_HOST=localhost `
  -e DB_PORT=5432 `
  -e DB_USERNAME=postgres `
  -e DB_PASSWORD=postgres123 `
  -e DB_NAME=debt_management_app `
  -e JWT_SECRET=your-super-secret-key-here `
  -e NODE_ENV=production `
  dluznik:latest
```

**Ważne:** Użyj backticks (`) zamiast backslash (\)!

---

### Metoda 3: Single Line (CMD)

```cmd
REM W cmd.exe:
docker run -p 3000:3000 -e DB_HOST=localhost -e DB_PORT=5432 -e DB_USERNAME=postgres -e DB_PASSWORD=postgres123 -e DB_NAME=debt_management_app -e JWT_SECRET=your-secret-key -e NODE_ENV=production dluznik:latest
```

---

## 🛠️ Pełny Setup - Krok po Kroku

### Krok 1: Build Image

```powershell
# Przejdź do folderu
cd C:\Users\catsy\OneDrive\Pulpit\Dluznik

# Build
docker build -t dluznik:latest .

# Sprawdzaj czy builد się pomyślnie
docker images | grep dluznik
```

### Krok 2: Start PostgreSQL Container

```powershell
# Jeśli używasz docker-compose (POLECAM):
docker-compose up -d db

# Lub ręcznie:
docker run -d `
  --name postgres-dluznik `
  -e POSTGRES_DB=debt_management_app `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres123 `
  -p 5432:5432 `
  postgres:15-alpine
```

### Krok 3: Run App Container

```powershell
# Metoda A: docker-compose (NAJŁATWIEJ)
docker-compose up -d app

# Metoda B: docker run
docker run -d `
  --name dluznik-app `
  --link postgres-dluznik:db `
  -p 3000:3000 `
  -e NODE_ENV=production `
  -e PORT=3000 `
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres-dluznik:5432/debt_management_app" `
  -e JWT_SECRET="your-super-secret-key-32-chars" `
  dluznik:latest

# Metoda C: docker run (bez link - sieć)
docker network create dluznik-network
docker run -d `
  --name dluznik-app `
  --network dluznik-network `
  -p 3000:3000 `
  -e NODE_ENV=production `
  -e PORT=3000 `
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres-dluznik:5432/debt_management_app" `
  -e JWT_SECRET="your-super-secret-key" `
  dluznik:latest
```

### Krok 4: Sprawdzaj Status

```powershell
# Logi
docker logs -f dluznik-app

# Status
docker ps

# Details
docker inspect dluznik-app

# Network
docker network inspect dluznik-network
```

### Krok 5: Test

```bash
# Health check
curl http://localhost:3000/health

# Otwórz przeglądarkę
http://localhost:3000
```

---

## 📋 docker-compose vs docker run

### docker-compose (POLECAM)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=debt_management_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Pros:**
- ✅ Alle services in jednym pliku
- ✅ Auto networking
- ✅ Easy version control
- ✅ `docker-compose up` = everything

### docker run (Manual)
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=... \
  dluznik:latest
```

**Pros:**
- ✅ Prosty dla single container
- ✅ Kontrola nad każdym parametrem

---

## 🔧 Problemy & Rozwiązania

### Problem 1: "Cannot find module"

```
Error: Cannot find module 'express'
```

**Fix:**
```powershell
# Dockerfile nie zainstalował dependencies
# Sprawdzaj Dockerfile - powinien mieć:

# RUN npm ci --only=production

# Lub rebuild
docker build --no-cache -t dluznik:latest .
```

### Problem 2: "Connection refused" (Database)

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
```powershell
# 1. Sprawdzaj czy PostgreSQL container running
docker ps | grep postgres

# 2. Jeśli nie, start go
docker-compose up -d db
# lub
docker run -d --name postgres-dluznik -p 5432:5432 postgres:15-alpine

# 3. Sprawdzaj connectivity
docker exec dluznik-app nc -zv postgres-dluznik 5432

# 4. Jeśli używasz localhost:5432:
# ZMIEŃ na: postgres-dluznik:5432 (wewnątrz network)
```

### Problem 3: "Port already in use"

```
Error: bind: address already in use
```

**Fix:**
```powershell
# 1. Sprawdzaj co używa port
netstat -ano | findstr :3000

# 2. Kill process
taskkill /PID <PID> /F

# 3. Lub użyj inny port
docker run -p 3001:3000 dluznik:latest
```

### Problem 4: "Out of memory"

```
Error: Cannot allocate memory
```

**Fix:**
```powershell
# Zwiększ Docker memory
# Docker Desktop → Settings → Resources → Memory: 4GB+

# Lub usun image i rebuild
docker rmi dluznik:latest
docker build -t dluznik:latest .
```

### Problem 5: Networking issues

```
Error: getaddrinfo ENOTFOUND postgres-dluznik
```

**Fix:**
```powershell
# 1. Sprawdzaj czy containers są w tej samej sieci
docker network ls
docker network inspect dluznik-network

# 2. Podłącz do sieci
docker network connect dluznik-network dluznik-app

# 3. Lub użyj --link (deprecated ale działa)
docker run --link postgres-dluznik:db ...
```

---

## ✅ Pełny Working Setup

### docker-compose.yml (już masz!)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres123@db:5432/debt_management_app
      - JWT_SECRET=your-super-secret-key-change-this
      - PORT=3000
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=debt_management_app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### .env file (dla docker-compose)

```env
DB_PASSWORD=postgres123
JWT_SECRET=your-super-secret-random-key-32-chars
NODE_ENV=production
```

### Uruchomienie

```powershell
# 1. Build (first time)
docker build -t dluznik:latest .

# 2. Run everything
docker-compose up -d

# 3. Sprawdzaj
docker-compose ps
docker-compose logs -f app

# 4. Test
curl http://localhost:3000/health

# 5. Stop
docker-compose down
```

---

## 📊 Environment Variables Czek

### Wymagane zmienne

```env
NODE_ENV=production           # MUST BE
PORT=3000                     # Backend port
DATABASE_URL=postgresql://... # OR individual DB vars:
  DB_HOST=db
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=postgres123
  DB_NAME=debt_management_app
JWT_SECRET=<random-string>    # MUST CHANGE
CORS_ORIGIN=localhost:3000    # Gdzie jest frontend
```

### W docker-compose

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - DATABASE_URL=postgresql://postgres:postgres123@db:5432/debt_management_app
  - JWT_SECRET=your-secret-key
```

### W docker run

```powershell
docker run `
  -e NODE_ENV=production `
  -e PORT=3000 `
  -e DATABASE_URL=postgresql://... `
  -e JWT_SECRET=your-secret-key `
  dluznik:latest
```

---

## 🎯 Cheat Sheet

### Build
```powershell
docker build -t dluznik:latest .
```

### Run (all-in-one)
```powershell
docker-compose up -d
```

### Stop
```powershell
docker-compose down
```

### Logs
```powershell
docker-compose logs -f app
```

### Status
```powershell
docker-compose ps
docker ps
```

### Remove containers
```powershell
docker-compose down -v
docker system prune -a
```

### Clean everything
```powershell
docker-compose down -v
docker rmi dluznik:latest
docker system prune -a -f
```

---

## 🚀 Working Commands - Copy Paste

### PowerShell - docker-compose

```powershell
# 1. Build
docker build -t dluznik:latest .

# 2. Run (z docker-compose)
docker-compose up -d

# 3. Logs
docker-compose logs -f app

# 4. Test
Invoke-WebRequest -Uri "http://localhost:3000/health"

# 5. Stop
docker-compose down

# 6. Clean
docker-compose down -v
```

### PowerShell - Manual

```powershell
# 1. Build
docker build -t dluznik:latest .

# 2. Network
docker network create dluznik-network

# 3. PostgreSQL
docker run -d `
  --name postgres-dluznik `
  --network dluznik-network `
  -e POSTGRES_DB=debt_management_app `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres123 `
  -p 5432:5432 `
  postgres:15-alpine

# 4. App
docker run -d `
  --name dluznik-app `
  --network dluznik-network `
  -p 3000:3000 `
  -e NODE_ENV=production `
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres-dluznik:5432/debt_management_app" `
  -e JWT_SECRET="your-super-secret-key" `
  dluznik:latest

# 5. Logs
docker logs -f dluznik-app

# 6. Test
Invoke-WebRequest -Uri "http://localhost:3000/health"

# 7. Stop all
docker stop dluznik-app postgres-dluznik
docker rm dluznik-app postgres-dluznik
```

---

## ✅ Verification Checklist

- [ ] Docker zainstalowany: `docker --version`
- [ ] Docker daemon running: `docker ps`
- [ ] Image built: `docker images | grep dluznik`
- [ ] Container running: `docker ps | grep dluznik`
- [ ] Aplikacja accessible: `http://localhost:3000`
- [ ] Health check OK: `http://localhost:3000/health`
- [ ] Database connected: Logi bez error
- [ ] Frontend loads: Możesz zobaczyć UI

---

## 🎯 TLDR - Najszybciej

```powershell
cd C:\Users\catsy\OneDrive\Pulpit\Dluznik

docker build -t dluznik:latest .

docker-compose up -d

# Gotowe! Aplikacja na http://localhost:3000
```

---

## 📞 Jeśli Nie Działa

### Step 1: Sprawdzaj Logi
```powershell
docker-compose logs app
docker logs dluznik-app
```

### Step 2: Sprawdzaj Status
```powershell
docker ps -a
docker inspect dluznik-app
```

### Step 3: Sprawdzaj Network
```powershell
docker network inspect dluznik-network
docker exec dluznik-app ping db
```

### Step 4: Restart
```powershell
docker-compose restart
```

### Step 5: Clean & Rebuild
```powershell
docker-compose down -v
docker system prune -a -f
docker build --no-cache -t dluznik:latest .
docker-compose up -d
```

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Platform:** Windows PowerShell  
**Status:** ✅ TESTED & WORKING

🐳 **Powodzenia z Docker!** 🐳
