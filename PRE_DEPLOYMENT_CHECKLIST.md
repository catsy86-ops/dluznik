# ✅ Pre-Deployment Checklist - Aplikacja Dłużnik

## 📋 Przed Deploymentem - Co Sprawdzić?

Czas: ~30 minut  
Priorytet: **KRITYCZNY** - Zrób to ZANIM deployujesz!

---

## 🔒 Security Checklist

### Environment Variables
- [ ] `JWT_SECRET` - Zmień na losowy, 32+ znaki
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] `NODE_ENV=production` - Nie development!
- [ ] Usuń debug flags
- [ ] Sprawdzaj sensitive data nie są w kodzie
- [ ] `.env` jest w `.gitignore`
- [ ] Production `.env` jest secure

### Database Security
- [ ] Hasło bazodanowe jest strong (12+ znaków, mixed case, numbers, special chars)
- [ ] Database user ma ograniczone uprawnienia (nie root/postgres)
- [ ] SSL enabled dla database connection
- [ ] Database backups skonfigurowane
- [ ] Nie masz default credentials w kodzie

### API Security
- [ ] CORS prawidłowo skonfigurowany (nie `*`)
- [ ] Rate limiting włączony
- [ ] Input validation
- [ ] SQL injection protection (TypeORM chroni)
- [ ] CSRF tokens (jeśli potrzebne)
- [ ] Authentication middleware na chronione routes
- [ ] Password hashing (bcrypt używany)
- [ ] Helmet middleware włączony
- [ ] HTTPS enforced

### Code Security
- [ ] Brak hardcoded secrets w kodzie
- [ ] Brak console.log() w production
- [ ] Brak test/debug code w production
- [ ] Dependencies są up-to-date
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Brak known vulnerabilities
- [ ] Brak sensitive data w logs

---

## 🏗️ Code & Build Checklist

### TypeScript & Compilation
- [ ] TypeScript bez błędów
  ```bash
  npx tsc --noEmit
  ```
- [ ] ESLint bez błędów
  ```bash
  npm run lint
  ```
- [ ] Build się pomyślnie kompiluje
  ```bash
  npm run build
  ```
- [ ] Brak warnings w build output

### Application Tests
- [ ] Testy przechodzą lokalnie
  ```bash
  npm test
  ```
- [ ] Code coverage > 70% (opcjonalnie)
- [ ] Manual testing completed
  - [ ] Login flow
  - [ ] Rejestracja flow
  - [ ] Loan/Obligation CRUD
  - [ ] Error handling
  - [ ] Edge cases

### Code Quality
- [ ] Brak unused imports
- [ ] Brak unused variables
- [ ] Proper error handling
- [ ] Consistent code style
- [ ] Comments where needed
- [ ] No memory leaks
- [ ] No infinite loops
- [ ] Proper async/await usage

---

## 📦 Dependencies Checklist

### npm Dependencies
- [ ] Wszystkie dependencies w package.json (nie brakuje)
  ```bash
  npm install
  npm list
  ```
- [ ] Brak deprecated packages
- [ ] Brak unused packages
  ```bash
  npm prune
  ```
- [ ] Lock file updated
  ```bash
  git add package-lock.json
  ```

### Security Audit
- [ ] Brak high severity vulnerabilities
  ```bash
  npm audit
  ```
- [ ] Brak medium severity (jeśli możliwe)
- [ ] Update podatne pakiety:
  ```bash
  npm audit fix
  ```

### Node Version
- [ ] Node version OK (>= 18)
  ```bash
  node --version
  ```
- [ ] Specyfikuj w package.json:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

---

## 🗄️ Database Checklist

### Database Setup
- [ ] PostgreSQL version compatible
- [ ] Database migrations готowe
- [ ] Seed data jeśli potrzebne
- [ ] Connection string correct
- [ ] SSL mode configured (production)
- [ ] Connection pooling configured
- [ ] Database size acceptable

### Schema & Data
- [ ] Wszystkie tabele created
- [ ] Wszystkie indexy created
- [ ] Foreign keys configured
- [ ] Constraints in place
- [ ] Brak orphaned data
- [ ] Backup process documented

### Performance
- [ ] Slow queries identified
- [ ] Indexes on foreign keys
- [ ] Pagination implemented (dla list endpoints)
- [ ] No N+1 queries
- [ ] Query optimization done

---

## 🌐 Frontend (Client) Checklist

### Build & Optimization
- [ ] Frontend builds successfully
  ```bash
  cd client
  npm run build
  ```
- [ ] Build output in dist/
- [ ] Bundle size acceptable
- [ ] No build warnings
- [ ] Source maps (optional)

### Performance
- [ ] Images optimized
- [ ] CSS minified
- [ ] JS minified
- [ ] Gzip compression enabled
- [ ] Lazy loading implemented
- [ ] Bundle analysis done

### Functionality
- [ ] All pages load
- [ ] Links work correctly
- [ ] Forms submit
- [ ] API calls work
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Dark mode works (jeśli masz)

### Browser Compatibility
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile browsers ✅

---

## 🔌 API & Endpoints Checklist

### Health Check
- [ ] Health endpoint works
  ```bash
  curl http://localhost:3000/health
  ```
- [ ] Returns proper status code

### Authentication Endpoints
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me
- [ ] Authentication middleware works

### Data Endpoints
- [ ] GET /api/loans (list)
- [ ] POST /api/loans (create)
- [ ] GET /api/loans/:id (read)
- [ ] PUT /api/loans/:id (update)
- [ ] DELETE /api/loans/:id (delete)
- [ ] Similar for /api/obligations
- [ ] Similar for /api/payments

### Error Handling
- [ ] 400 Bad Request - invalid input
- [ ] 401 Unauthorized - not authenticated
- [ ] 403 Forbidden - not authorized
- [ ] 404 Not Found - resource not found
- [ ] 500 Server Error - server error
- [ ] Error messages are helpful

---

## 📝 Configuration Checklist

### Environment Configuration
- [ ] `.env.example` is updated
- [ ] Production env variables documented
- [ ] All required env vars listed
- [ ] Default values set (jeśli applicable)
- [ ] Sensitive data not in git

### Application Configuration
- [ ] PORT configured
- [ ] Database configuration correct
- [ ] CORS settings correct
- [ ] Logging level appropriate
- [ ] Timeout values reasonable
- [ ] Session timeout configured

### Production Settings
- [ ] NODE_ENV=production
- [ ] Debug disabled
- [ ] Verbose logging disabled
- [ ] Development tools disabled
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

---

## 📊 Monitoring & Logging Checklist

### Logging Setup
- [ ] Logger configured
- [ ] Log levels appropriate (info, warn, error)
- [ ] Sensitive data not logged
- [ ] Log rotation configured
- [ ] Log storage sufficient

### Error Tracking (Optional)
- [ ] Error tracking service set up (Sentry, etc.)
- [ ] Webhooks configured
- [ ] Alerts configured

### Monitoring
- [ ] Health check endpoint ready
- [ ] Metrics endpoints ready (optional)
- [ ] Performance monitoring set up
- [ ] Database monitoring set up
- [ ] Uptime monitoring configured

---

## 🚀 Deployment Platform Checklist

### Platform Setup
- [ ] Account created
- [ ] Project created
- [ ] Environment configured
- [ ] Deployment method configured (Git, Docker, etc.)
- [ ] Automatic deployments configured (optional)

### Platform Specific
- **Railway:**
  - [ ] GitHub repo connected
  - [ ] PostgreSQL service added
  - [ ] Environment variables set
  
- **Heroku:**
  - [ ] Heroku app created
  - [ ] Procfile correct
  - [ ] PostgreSQL add-on added
  - [ ] Heroku config vars set
  
- **VPS:**
  - [ ] Server provisioned
  - [ ] Node.js installed
  - [ ] PM2 installed
  - [ ] Nginx configured
  - [ ] SSL certificates installed

---

## 🔑 Credentials & Secrets Checklist

### Generate Secure Secrets
- [ ] JWT_SECRET generated
  ```bash
  openssl rand -base64 32
  ```
- [ ] Database password strong
- [ ] API keys generated (if needed)
- [ ] All secrets stored securely
- [ ] No secrets in version control

### Credentials Management
- [ ] Production credentials separate from dev
- [ ] Credentials rotated regularly
- [ ] Access control in place
- [ ] Audit trail for access
- [ ] Backup of credentials (encrypted)

---

## 🔗 DNS & Domain Checklist

### Domain Setup
- [ ] Domain purchased
- [ ] DNS provider configured
- [ ] A/CNAME records set up
- [ ] MX records set up (if email)
- [ ] TXT records set up (if needed)
- [ ] DNS propagation verified
  ```bash
  nslookup your-domain.com
  ```

### SSL/TLS
- [ ] SSL certificate obtained
- [ ] Certificate valid and not expired
- [ ] HTTPS enforced
- [ ] Auto-renewal configured
- [ ] Certificate chain correct

---

## 🆘 Backup & Recovery Checklist

### Database Backups
- [ ] Backup schedule configured
- [ ] Backup storage secure
- [ ] Backups encrypted
- [ ] Test restore procedure
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

### Application Backups
- [ ] Source code backed up (git)
- [ ] Configuration backed up
- [ ] Database backups automated
- [ ] Off-site backup storage

### Disaster Recovery
- [ ] Recovery plan documented
- [ ] Recovery steps tested
- [ ] Rollback procedure documented
- [ ] Previous version available

---

## 📋 Documentation Checklist

### README
- [ ] Installation instructions
- [ ] Configuration instructions
- [ ] Running instructions
- [ ] Deployment instructions
- [ ] Support/contact info

### API Documentation
- [ ] API endpoints documented
- [ ] Request/response examples
- [ ] Error codes documented
- [ ] Authentication explained

### Deployment Documentation
- [ ] Deployment steps
- [ ] Environment setup
- [ ] Database setup
- [ ] Monitoring setup
- [ ] Troubleshooting guide

---

## ✅ Final Verification

### Local Testing
- [ ] Application runs locally ✅
  ```bash
  npm run dev
  ```
- [ ] Database connects ✅
- [ ] Frontend loads ✅
- [ ] Can login ✅
- [ ] Can CRUD loans ✅
- [ ] Can CRUD obligations ✅
- [ ] API endpoints respond ✅

### Team Review (if team)
- [ ] Code review passed
- [ ] Security review passed
- [ ] Performance review passed
- [ ] Architecture review passed

### Deployment Rehearsal
- [ ] Test deploy to staging
- [ ] Verify all functionality
- [ ] Monitor for errors
- [ ] Test recovery procedure

---

## 🎯 Final Sign-Off

- [ ] All checklist items completed
- [ ] No critical issues
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Team approved
- [ ] Ready for production! 🚀

---

## 🚨 Pre-Deployment Risk Assessment

### Risk Level: RED 🔴 (Stop & Fix!)
```
❌ Security vulnerabilities (HIGH severity)
❌ Failed tests
❌ Compilation errors
❌ No database backups
❌ Missing critical dependencies
→ DO NOT DEPLOY - FIX FIRST
```

### Risk Level: YELLOW 🟡 (Review & Decide)
```
⚠️ Medium severity vulnerabilities (can be updated)
⚠️ Minor lint warnings (not critical)
⚠️ Performance optimization possible (but acceptable)
⚠️ Low test coverage (but working)
→ CAN DEPLOY with caution - MONITOR CLOSELY
```

### Risk Level: GREEN 🟢 (Safe to Deploy)
```
✅ No critical issues
✅ All tests pass
✅ Clean code
✅ Secure configuration
✅ Ready for production
→ SAFE TO DEPLOY
```

---

## 📞 Post-Deployment

Zaraz po deploymencie:

1. **Monitor aplikację** (first 30 minutes)
   - Sprawdzaj logi
   - Obserwuj metrics
   - Test key functionality

2. **Notify team**
   - Poinformuj zespół
   - Wyślij deployment notes
   - Status update

3. **Collect feedback**
   - Monitor user reports
   - Track errors
   - Performance metrics

4. **Have rollback ready**
   - Wiesz jak rollback'ować
   - Previous version available
   - Customers can't be affected

---

## 📊 Deployment Timeline

```
T-24h: Final review
T-4h:  This checklist
T-1h:  Final tests
T-0:   DEPLOY! 🚀
T+5m:  Monitor logs
T+30m: Verify functionality
T+1h:  Stable? → Notify team
T+4h:  Monitor metrics
T+24h: Full assessment
```

---

## 🎉 You're Ready!

Jeśli całkowicie przeszedłeś ten checklist:

✅ Twoja aplikacja jest bezpieczna  
✅ Twoja aplikacja jest gotowa  
✅ Twoja aplikacja będzie działać  
✅ Jesteś gotowy do deployment'u!

---

**Wersja:** 1.0.0  
**Data:** 26 maja 2026  
**Czas:** ~30 minut  
**Ważność:** KRITYCZNA

🚀 **Happy Deploying!** 🚀
