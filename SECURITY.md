# 🔒 Security Guide - AstroNova

## Overview

This document outlines the security practices and protections in place for AstroNova.

---

## 🚫 Secrets Protection

### ✅ What's Protected

All sensitive credentials are protected by the following measures:

| Secret | Protection | Location |
|--------|-----------|----------|
| **API Keys** | In `.env` files (ignored by Git) | `backend/.env`, `frontend/.env` |
| **Database Passwords** | Environment variables only | `.env` files |
| **Third-party Tokens** | Never hardcoded in code | `.env` files |
| **JWT Secrets** | Environment variables | `.env` files |

### ✅ `.gitignore` Configuration

**Root `.gitignore`:**
```
.env
.env.local
.env.*.local
.env.production.local
```

**Backend `backend/.gitignore`:**
```
node_modules/
.env
.env.local
.env.*.local
```

**Frontend `frontend/.gitignore`:**
```
.env
.env.local
.env.*.local
.env.production
```

### ✅ `.env.example` Files

**These ARE committed to Git** to show developers what environment variables are needed:

- `backend/.env.example` - Contains placeholder API key names
- `frontend/.env.example` - Contains placeholder values

**Example content:**
```
N2YO_API_KEY=your_n2yo_api_key_here  # NOT a real key
NASA_API_KEY=your_nasa_api_key_here  # NOT a real key
```

---

## 🔑 API Keys Management

### Getting Your Own Keys

| Service | URL | Purpose |
|---------|-----|---------|
| N2YO | https://www.n2yo.com/api/ | Satellite tracking |
| NASA | https://api.nasa.gov/ | Asteroid & APOD data |
| Astronomy API | https://www.astronomyapi.com/ | Moon & planet positions |
| Google Gemini | https://makersuite.google.com/app/apikey | AI responses |

### Backend API Keys (Must Have)

Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Then fill in your actual keys in `backend/.env`:
```
N2YO_API_KEY=your_actual_key_here
NASA_API_KEY=your_actual_key_here
ASTRONOMY_APP_ID=your_id_here
ASTRONOMY_APP_SECRET=your_secret_here
GEMINI_API_KEY=your_key_here
```

### Frontend Environment (Optional)

Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

Only `VITE_API_URL` is required. Cesium token is optional:
```
VITE_API_URL=http://localhost:5000/api
VITE_CESIUM_ION_TOKEN=  # Optional, leave blank if not needed
```

---

## 🚨 Before Pushing to GitHub

**Checklist:**

- [ ] No `.env` files are committed (check `.gitignore`)
- [ ] Run `git status` to verify `.env` files are NOT staged
- [ ] `.env.example` files exist with ONLY placeholder values
- [ ] No hardcoded secrets in source code (grep for API_KEY, SECRET, password)
- [ ] No secrets in commit messages
- [ ] No secrets in documentation files

### Commands to Verify

```bash
# Check if .env files are ignored
git status

# Search for hardcoded secrets
grep -r "GEMINI_API_KEY=" src/
grep -r "NASA_API_KEY=" src/
grep -r "N2YO_API_KEY=" src/

# Verify only .env.example files are tracked
git ls-files | grep ".env"

# Should only show:
# backend/.env.example
# frontend/.env.example
```

---

## 🛡️ Production Deployment

### Render / Heroku / Railway

1. **Never commit `.env` to repository**
2. **Use platform's environment variable UI to set secrets:**
   ```
   Render → Settings → Environment
   Heroku → Settings → Config Vars
   Railway → Variables
   ```

3. **Set these environment variables:**
   ```
   NODE_ENV=production
   PORT=5000
   N2YO_API_KEY=<your_key>
   NASA_API_KEY=<your_key>
   ASTRONOMY_APP_ID=<your_id>
   ASTRONOMY_APP_SECRET=<your_secret>
   GEMINI_API_KEY=<your_key>
   FRONTEND_URL=https://your-frontend-url.com
   ```

### Docker (if using containers)

**Dockerfile should NOT include secrets:**
```dockerfile
# ❌ BAD - Do NOT do this:
ENV GEMINI_API_KEY=sk_live_xxxxx

# ✅ GOOD - Pass at runtime:
# Use --build-arg or compose environment variables
```

---

## 🔐 Code Security Best Practices

### ✅ Do This

```javascript
// Load from environment variables (safe)
import { config } from './config/env.js';

class NASAService {
  constructor() {
    this.apiKey = config.nasaApiKey; // From process.env
  }
}
```

### ❌ Don't Do This

```javascript
// ❌ NEVER hardcode secrets
const apiKey = "sk_live_1234567890";
const secret = "supersecretpassword";
```

---

## 🔍 Monitoring & Alerts

If you accidentally commit a secret:

1. **Revoke the API key immediately** on the service's dashboard
2. **Generate a new API key**
3. **Force push (or rewrite history):**
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Update your `.env` with the new key**
5. **Re-deploy with the new key**

---

## 📋 Audit Trail

### Files to Check Before Each Commit

1. ✅ `backend/.env.example` - Should have placeholders only
2. ✅ `frontend/.env.example` - Should have placeholders only
3. ✅ `backend/.gitignore` - Should include `.env`
4. ✅ `frontend/.gitignore` - Should include `.env`
5. ✅ `.gitignore` (root) - Should include `.env`
6. ✅ No hardcoded credentials in any `.js`, `.ts`, `.jsx`, `.tsx` files

### Files That Should NEVER Be Committed

```
.env
.env.local
.env.production
.env.production.local
.env.staging
backend/.env
frontend/.env
```

### Files That SHOULD Be Committed

```
.env.example
backend/.env.example
frontend/.env.example
.gitignore
SECURITY.md (this file)
```

---

## 🆘 If Something Goes Wrong

### Accidentally Committed a Secret?

1. **Revoke the secret immediately** (check the service's website)
2. **Generate a new secret**
3. **Rewrite git history** (optional but recommended):
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     HEAD
   ```
4. **Force push if you're the only one on the repo:**
   ```bash
   git push --force origin main
   ```
5. **Alert team members to pull the updated history**

### Exposed API Key on GitHub?

1. Generate a new API key on the service
2. Update your `.env` file locally
3. Run: `git rm --cached backend/.env` (if it was committed)
4. Commit: `git commit -m "chore: remove .env file"`
5. Push: `git push origin main`
6. The old key should be invalidated immediately anyway, but generate a new one just in case

---

## 📚 References

- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP - Secrets Management](https://owasp.org/www-community/vulnerabilities/Sensitive_Data_Exposure)
- [npm - Protecting Secrets](https://docs.npmjs.com/about-npm/security)

---

## ✅ Security Checklist

Run this before EVERY push to GitHub:

```bash
# 1. Check that .env files are in .gitignore
cat .gitignore | grep ".env"

# 2. Verify .env files are NOT staged
git status

# 3. Search for hardcoded keys in code
grep -r "sk_live" backend/src/ frontend/src/
grep -r "ya29" backend/src/ frontend/src/  # Google tokens
grep -r "AIza" backend/src/ frontend/src/  # API keys

# 4. Verify only .env.example files exist in repo
git ls-files | grep "\.env"

# 5. Check commit messages for secrets
git log --oneline -10 | grep -i "key\|secret\|token\|password"

# 6. Final check: List what will be committed
git diff --cached --name-only
```

---

**Last Updated:** 2026-06-13  
**Status:** ✅ All systems secure
