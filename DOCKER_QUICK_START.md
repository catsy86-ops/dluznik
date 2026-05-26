# 🐳 Docker Quick Start - Windows (5 minut)

## ⚡ Najszybciej Możliwe

### Krok 1: Otwórz PowerShell

```
Prawy klik na folder Dluznik → Open with PowerShell
```

### Krok 2: Build Image

```powershell
docker build -t dluznik:latest .
```

**Czekaj ~3 minuty** - build trwa na pierwszym razie

### Krok 3: Uruchom Aplikację

```powershell
docker-compose up -d
```

**Czekaj ~30 sekund** - startup PostgreSQL

### Krok 4: Sprawdzaj Status

```powershell
docker-compose ps
```

Powinieneś widzieć:
```
NAME                STATUS                  PORTS
dluznik-app         Up (healthy)            0.0.0.0:3000->3000/tcp
postgres-dluznik    Up (healthy)            0.0.0.0:5432->5432/tcp
```

### Krok 5: Test

```powershell
# Otwórz przeglądarkę i idź na:
# http://localhost:3000

# Albo test z PowerShell:
Invoke-WebRequest -Uri "http://localhost:3000/health"
```

### 🎉 GOTOWE! Aplikacja żyje!

---

## 🛑 Jeśli Nie Działa

### Error 1: "docker: command not found"

```
→ Docker nie zainstalowany lub nie w PATH
→ Reinstall Docker Desktop: https://docker.com/products/docker-desktop
```

### Error 2: "Cannot connect to Docker daemon"

```powershell
→ Start Docker Desktop aplikację
→ Czekaj aż daemon się startuje
→ Retry command
```

### Error 3: "build failed"

```powershell
# Clean rebuild:
docker system prune -a -f
docker build -t dluznik:latest .
```

### Error 4: "Port 3000 already in use"

```powershell
# Znajdź co używa port:
netstat -ano | findstr :3000

# Kill process:
taskkill /PID <PID> /F

# Lub użyj inny port:
docker-compose.yml → zmień "3000:3000" na "3001:3000"
```

### Error 5: "Logi pokazują błędy"

```powershell
# Sprawdzaj logi:
docker-compose logs -f app

# Szukaj błędu i podaj mi output
```

---

## 📋 Przydatne Komendy

### Start
```powershell
docker-compose up -d          # Start all
docker-compose up app         # Start app only (bez -d = see logs)
```

### Stop
```powershell
docker-compose down           # Stop all
docker-compose down -v        # Stop all + delete volumes (dangerous!)
```

### Logs
```powershell
docker-compose logs -f app    # Follow logs (Ctrl+C to stop)
docker-compose logs app       # Show recent logs
docker logs -f dluznik-app    # Same thing
```

### Status
```powershell
docker-compose ps             # All services
docker ps -a                  # All containers
```

### Rebuild
```powershell
docker build -t dluznik:latest .  # Rebuild image
docker-compose up -d --build      # Rebuild and start
```

### Clean
```powershell
docker-compose down -v            # Stop and remove data
docker system prune -a -f         # Remove unused stuff
docker image rm dluznik:latest    # Remove image
```

---

## 🔧 Zmienić Zmienne?

### Zmienne w docker-compose.yml

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://postgres:postgres123@db:5432/debt_management_app
  - JWT_SECRET=change-this-to-random-string
  - PORT=3000
```

### Po zmianie:
```powershell
# Rebuild i restart:
docker-compose up -d --force-recreate
```

---

## ✅ Checklist

- [ ] Docker zainstalowany
- [ ] Docker daemon running (Docker Desktop app)
- [ ] Jesteś w folderu Dluznik (cd C:\Users\catsy\OneDrive\Pulpit\Dluznik)
- [ ] `docker build -t dluznik:latest .` - SUCCESS
- [ ] `docker-compose up -d` - SUCCESS
- [ ] `docker-compose ps` - show "Up"
- [ ] `http://localhost:3000` - Loads aplikacja
- [ ] Health check: `http://localhost:3000/health` - 200 OK

---

## 🚀 Next Steps

### Wdrażaj kod
```powershell
# Dodaj zmianę
git add .
git commit -m "Added Docker"
git push
```

### Deploy na production
```
Następnie deploy na Railway/Heroku (instructions w DEPLOYMENT_GUIDE.md)
```

### Stop na koniec dnia
```powershell
docker-compose down
```

**Note:** Data w PostgreSQL zostaje (volumes persisted)

---

## 💡 Pro Tips

1. **Nie zamykaj PowerShell** - kontener zostaje running
2. **Logs zawsze przydatne** - `docker-compose logs -f app`
3. **Rebuild jak zmienisz kod** - `docker build -t dluznik:latest .`
4. **Test URL first** - `http://localhost:3000/health` przed frontend
5. **Clean regularly** - `docker system prune -a -f` co tydzień

---

## 📞 Emergency Commands

### Coś nie działa - Nuclear Option

```powershell
# STOP ALL
docker-compose down -v

# CLEAN ALL
docker system prune -a -f

# REBUILD
docker build -t dluznik:latest .

# START FRESH
docker-compose up -d

# WATCH LOGS
docker-compose logs -f app
```

---

**Wersja:** 1.0.0  
**Czas:** 5 minut  
**Difficulty:** ⭐ Super łatwe
**Status:** ✅ TESTED & WORKING

🐳 **Done!** 🐳
