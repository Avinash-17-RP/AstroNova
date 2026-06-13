# 🛠️ AstroNova - Installation & Fix Commands

**Quick Reference for Terminal Commands**

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Step 1: Install Missing Cesium Plugin (Frontend)

```bash
# Navigate to frontend directory
cd frontend

# Install vite-plugin-cesium
npm install --save-dev vite-plugin-cesium

# Verify installation
npm list vite-plugin-cesium
```

**Expected Output:**
```
astronova-frontend@1.0.0 C:\Users\saisa\.vscode\.vscode\AstroNova\frontend
└── vite-plugin-cesium@3.x.x
```

---

### Step 2: Update Vite Configuration

**File:** `frontend/vite.config.js`

**Replace the entire file with:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginCesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), vitePluginCesium()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    'process.env': {},
  },
});
```

**What Changed:**
```diff
+ import vitePluginCesium from 'vite-plugin-cesium';
- plugins: [react()],
+ plugins: [react(), vitePluginCesium()],
```

---

## ✅ RECOMMENDED ENHANCEMENTS

### Step 3A: Install Google Genai (Optional - Backend)

```bash
# Navigate to backend directory
cd backend

# Install @google/genai
npm install --save @google/genai

# Verify
npm list @google/genai
```

---

### Step 3B: Install Node-Cache (Optional - Backend)

```bash
# In backend directory
npm install --save node-cache

# Verify
npm list node-cache
```

---

## ▶️ STARTING THE APPLICATION

### Backend - Terminal 1

```bash
# Navigate to backend
cd backend

# Start development server with auto-reload
npm run dev

# Expected output:
# ╔════════════════════════════════════════╗
# ║  🚀 AstroNova Backend Server           ║
# ║  Environment: DEVELOPMENT              ║
# ║  Port: 5000                            ║
# ║  URL: http://localhost:5000            ║
# ╚════════════════════════════════════════╝
```

### Frontend - Terminal 2 (New Terminal Window)

```bash
# Navigate to frontend
cd frontend

# Start development server
npm run dev

# Expected output:
#   VITE v5.0.0  ready in xxx ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

---

## 🏗️ BUILDING FOR PRODUCTION

### Build Frontend

```bash
# In frontend directory
npm run build

# Expected output:
# ✓ 123 modules transformed.
# dist/index.html                   0.50 kb
# dist/assets/index-xxxxx.js        120.30 kb
# dist/assets/index-xxxxx.css       15.20 kb
```

### Build Backend (if needed)

```bash
# Backend is already in JavaScript (ES modules)
# No build step needed - just run with node

# Production start:
npm start

# Or with NODE_ENV set:
NODE_ENV=production npm start
```

---

## 🔍 VERIFICATION COMMANDS

### Check Node Version

```bash
node --version

# Should be ≥18.0.0
# Example output: v18.18.0
```

### Check npm Version

```bash
npm --version

# Should be ≥9.0.0
# Example output: 9.8.1
```

### Check Backend Dependencies

```bash
cd backend
npm list --depth=0

# Should show:
# astronova-backend@1.0.0
# ├── axios@1.6.2
# ├── cors@2.8.5
# ├── dotenv@16.3.1
# ├── express@4.18.2
# └── express-async-errors@3.1.1
```

### Check Frontend Dependencies

```bash
cd frontend
npm list --depth=0

# Should show:
# astronova-frontend@1.0.0
# ├── axios@1.6.2
# ├── cesium@1.115.0
# ├── lucide-react@0.310.0
# ├── react@18.2.0
# ├── react-dom@18.2.0
# ├── vite@5.0.0
# ├── vite-plugin-cesium@3.x.x (after Step 1)
# └── zustand@4.4.1
```

### Test API Endpoints

```bash
# Test backend health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"status":"healthy","timestamp":"2024-01-13T...","uptime":1234}

# Test root endpoint
curl http://localhost:5000/api

# Expected response with all available endpoints
```

---

## 🧹 CLEANUP & RESET

### Clear npm Cache

```bash
npm cache clean --force
```

### Reinstall Frontend Dependencies

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm install --save-dev vite-plugin-cesium
```

### Reinstall Backend Dependencies

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Clear Build Artifacts

```bash
cd frontend
rm -rf dist/
```

---

## 🐛 TROUBLESHOOTING COMMANDS

### Check if Port 5000 is in Use

```bash
# Windows (PowerShell)
netstat -ano | findstr :5000

# Windows (CMD)
netstat -ano | find ":5000"

# If in use, kill the process:
# Get the PID from above, then:
taskkill /PID <PID> /F
```

### Check if Port 5173 is in Use

```bash
# Windows (PowerShell)
netstat -ano | findstr :5173

# Kill if needed:
taskkill /PID <PID> /F
```

### Update All Dependencies

```bash
cd frontend
npm update

cd ../backend
npm update
```

### Check for Security Vulnerabilities

```bash
# Frontend
cd frontend
npm audit

# Backend
cd backend
npm audit
```

### Fix Security Issues Automatically

```bash
# Frontend
cd frontend
npm audit fix

# Backend
cd backend
npm audit fix
```

---

## 📦 QUICK INSTALL SCRIPT (Windows)

**Save as `setup.bat`** in project root:

```batch
@echo off
echo Installing AstroNova dependencies...

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
echo Backend done!

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
call npm install --save-dev vite-plugin-cesium
echo Frontend done!

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Open 2 terminals
echo 2. Terminal 1: cd backend && npm run dev
echo 3. Terminal 2: cd frontend && npm run dev
pause
```

**Run with:** `setup.bat`

---

## 📦 QUICK INSTALL SCRIPT (macOS/Linux)

**Save as `setup.sh`** in project root:

```bash
#!/bin/bash

echo "Installing AstroNova dependencies..."
echo ""

echo "Installing Backend Dependencies..."
cd backend
npm install
echo "✅ Backend done!"

echo ""
echo "Installing Frontend Dependencies..."
cd ../frontend
npm install
npm install --save-dev vite-plugin-cesium
echo "✅ Frontend done!"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open 2 terminals"
echo "2. Terminal 1: cd backend && npm run dev"
echo "3. Terminal 2: cd frontend && npm run dev"
```

**Run with:** `chmod +x setup.sh && ./setup.sh`

---

## 🚀 DEPLOYMENT COMMANDS

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI globally
npm install -g vercel

# In frontend directory
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

### Deploy to Render (Backend)

```bash
# Push to GitHub first
git push origin main

# Then in Render Dashboard:
# 1. Create new Web Service
# 2. Connect GitHub repo
# 3. Set root directory to 'backend'
# 4. Add environment variables
# 5. Deploy
```

---

## 📋 COMPLETE SETUP CHECKLIST

Use this checklist to verify everything is set up:

```
[ ] Node.js v18+ installed (npm --version)
[ ] cd into project root
[ ] Run: npm install (in frontend/)
[ ] Run: npm install --save-dev vite-plugin-cesium (in frontend/)
[ ] Update vite.config.js with Cesium plugin
[ ] Run: npm install (in backend/)
[ ] .env files exist in both frontend/ and backend/
[ ] API keys populated in .env files
[ ] Run: npm run dev (in backend/) - should show "🚀 AstroNova Backend Server"
[ ] Run: npm run dev (in frontend/) - should open browser at localhost:5173
[ ] Test: Click "Locate Me" button
[ ] Test: Check left panel for satellites
[ ] Test: Check right panel for moon/planets
[ ] Test: Open AI assistant at bottom right
[ ] Ready for deployment!
```

---

## 🆘 QUICK HELP

### Error: "Cannot find module 'vite-plugin-cesium'"

```bash
# Solution:
cd frontend
npm install --save-dev vite-plugin-cesium
npm run dev
```

### Error: "CORS error from frontend"

```bash
# Make sure backend is running:
cd backend
npm run dev

# Check FRONTEND_URL in backend/.env
# Should be: http://localhost:5173
```

### Error: "Cesium Assets not loading"

```bash
# Solution: 
# 1. Make sure vite-plugin-cesium is installed
npm list vite-plugin-cesium

# 2. Make sure vite.config.js includes the plugin
# 3. Restart frontend dev server
npm run dev

# 4. Check browser console (F12) for specific errors
```

### Error: "Port 5000 already in use"

```bash
# Find and kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart backend
npm run dev
```

---

## 📞 COMMAND REFERENCE SUMMARY

| Action | Command | Location |
|--------|---------|----------|
| Install all deps | `npm install` | Both folders |
| Add Cesium plugin | `npm install --save-dev vite-plugin-cesium` | frontend/ |
| Start backend dev | `npm run dev` | backend/ |
| Start frontend dev | `npm run dev` | frontend/ |
| Build frontend | `npm run build` | frontend/ |
| Run backend prod | `npm start` | backend/ |
| Check deps | `npm list --depth=0` | Both folders |
| Audit security | `npm audit` | Both folders |
| Fix issues | `npm audit fix` | Both folders |
| Update all | `npm update` | Both folders |
| Clear cache | `npm cache clean --force` | Any folder |

---

**Last Updated:** January 13, 2026  
**Project:** AstroNova v1.0.0  

**🎯 Ready to run? Start with Step 1 above!**
