# Quick Start Guide

## 🚀 5-Minute Setup

### 1. Get API Keys (2 min)
- N2YO: https://www.n2yo.com/api/
- NASA: https://api.nasa.gov/
- Astronomy API: https://www.astronomyapi.com/
- Gemini: https://makersuite.google.com/app/apikey

### 2. Backend Setup (2 min)
```bash
cd backend
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### 3. Frontend Setup (1 min)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in your browser!

## 📋 API Key Quick Reference

| Service | URL | Get Key |
|---------|-----|---------|
| N2YO | https://www.n2yo.com/api/ | Sign up → API keys |
| NASA | https://api.nasa.gov/ | Fill form → Instant key |
| Astronomy API | https://www.astronomyapi.com/ | Sign up → Dashboard |
| Gemini | https://makersuite.google.com/app/apikey | Create key button |

## 🆘 Common Issues

**Port already in use?**
```bash
# Change port in backend .env or frontend vite.config.js
```

**CORS errors?**
```bash
# Ensure backend is running and FRONTEND_URL is correct in .env
```

**Cesium not loading?**
```bash
# Add Cesium token to frontend .env (optional but recommended)
```

## 📞 Getting Help

1. Check browser console (F12)
2. Verify .env files have all required keys
3. Ensure both backend and frontend are running
4. Check network tab in DevTools for API errors
