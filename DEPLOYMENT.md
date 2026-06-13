# Deployment Guide

## 🚀 Deployment Strategies

AstroNova is designed to be deployed across Vercel (frontend) and Render (backend). This guide covers all deployment options.

---

## Frontend Deployment (Vercel)

### Option 1: Deploy with Git (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/AstroNova.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Choose "Frontend" directory
   - Add environment variables:
     ```
     VITE_API_URL=https://astronova-api.onrender.com/api
     VITE_CESIUM_ION_TOKEN=your_cesium_token
     ```
   - Deploy

3. **Vercel Auto-deploys** on every push to main branch

### Option 2: Deploy with CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel
# Follow prompts
```

### Option 3: Deploy Manually

```bash
cd frontend
npm run build
vercel deploy --prod ./dist
```

---

## Backend Deployment (Render)

### Option 1: Deploy with Git (Recommended)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: astronova-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Root Directory**: backend

3. **Add Environment Variables**
   - Go to "Environment"
   - Add all keys from `.env.example`:
     ```
     PORT=5000
     NODE_ENV=production
     N2YO_API_KEY=your_key
     NASA_API_KEY=your_key
     ASTRONOMY_APP_ID=your_id
     ASTRONOMY_APP_SECRET=your_secret
     GEMINI_API_KEY=your_key
     FRONTEND_URL=https://your-frontend.vercel.app
     CACHE_DURATION=5
     ```

4. **Deploy**
   - Render auto-deploys on push to main

### Option 2: Manual Deployment

```bash
# Build
npm run build

# Deploy to hosting service
# Example for Heroku:
heroku create astronova-api
heroku config:set N2YO_API_KEY=your_key
git push heroku main
```

---

## Database Integration (Optional)

If you want to add data persistence:

### MongoDB (Recommended)

1. **Create MongoDB Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

2. **Install MongoDB Driver**
```bash
cd backend
npm install mongodb
```

3. **Update Configuration**
```javascript
// backend/src/config/env.js
export const config = {
  // ... existing config
  mongoUri: getEnv('MONGODB_URI'),
};
```

4. **Add to Render Environment Variables**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/astronova
```

---

## Environment Configuration

### Production .env

**Backend:**
```
PORT=5000
NODE_ENV=production
N2YO_API_KEY=sk_live_xxxx
NASA_API_KEY=AAAAA
ASTRONOMY_APP_ID=id
ASTRONOMY_APP_SECRET=secret
GEMINI_API_KEY=AIzaXXXX
FRONTEND_URL=https://astronova.vercel.app
CACHE_DURATION=10
MONGODB_URI=mongodb+srv://...
```

**Frontend:**
```
VITE_API_URL=https://astronova-api.onrender.com/api
VITE_CESIUM_ION_TOKEN=eyJhbGc...
```

---

## Domain Configuration

### Vercel Frontend

1. **Add Custom Domain**
   - Vercel Dashboard → Project Settings → Domains
   - Add your domain
   - Update DNS records (usually automatic)

### Render Backend

1. **Get Render URL**
   - Automatically assigned: `https://astronova-api.onrender.com`
   - Update in frontend environment variables

---

## CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AstroNova

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Frontend
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
      
      - name: Notify Render
        run: |
          curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Performance Optimization

### Frontend

1. **Enable Compression**
```javascript
// vite.config.js
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({
      algorithm: 'gzip',
    })
  ]
}
```

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Compress APOD images

3. **Code Splitting**
```javascript
// Already optimized in Vite
// Components auto-split at route level
```

### Backend

1. **Response Caching**
   - Already implemented with CACHE_DURATION
   - Add Redis for distributed caching:

```bash
npm install redis
```

```javascript
// backend/src/services/cache.js
import redis from 'redis';

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

export const cacheKey = (key) => {
  return client.get(key);
};

export const setCache = (key, value, ttl = 300) => {
  return client.setEx(key, ttl, JSON.stringify(value));
};
```

2. **Database Indexing**
```javascript
// Create indexes on frequently queried fields
db.collection('satellites').createIndex({ timestamp: -1 });
```

---

## Monitoring

### Error Tracking (Sentry)

1. **Install Sentry**
```bash
npm install @sentry/node
```

2. **Configure**
```javascript
// backend/src/server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

3. **Add SENTRY_DSN to environment variables**

### Analytics

- **Frontend**: Google Analytics, Mixpanel
- **Backend**: Datadog, New Relic

---

## Scaling

### Horizontal Scaling

**Backend:**
```bash
# Render supports auto-scaling
# Enable in Settings → Scaling
```

**Database:**
```javascript
// Use MongoDB sharding for large datasets
```

### Load Balancing

For multiple instances:
```bash
# Use Render's load balancer (automatic)
# Or Cloudflare for frontend CDN
```

---

## Security Checklist

- [ ] All API keys in environment variables
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Regular security audits
- [ ] Dependencies kept up-to-date
- [ ] Environment separation (dev/prod)
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info

---

## Troubleshooting

### Frontend won't load
```bash
# Clear Vercel cache
vercel env pull
npm run build
vercel deploy --prod
```

### Backend API errors
```bash
# Check Render logs
# Render Dashboard → Logs

# Verify environment variables are set
# Test endpoints with curl
curl https://astronova-api.onrender.com/api/health
```

### Database connection issues
```javascript
// Test connection in server.js
const testConnection = async () => {
  try {
    await db.connection.db.admin().ping();
    console.log('Database connected');
  } catch (error) {
    console.error('Database error:', error);
  }
};
```

---

## Rollback Strategy

```bash
# Revert to previous deployment
# Vercel: Dashboard → Deployments → Select → Promote
# Render: Dashboard → Events → Redeploy

# Manual git rollback
git revert HEAD
git push
```

---

## Cost Estimates (as of 2024)

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Vercel | Hobby | Free | 100GB/month bandwidth |
| Render | Free | Free | Spins down after 15min inactivity |
| Render | Starter | $7/month | Always-on instance |
| MongoDB Atlas | Free | Free | 512MB storage |
| Cesium Ion | Free | Free | $0.01 per tile |
| Gemini API | Free | Free | 60 req/min limit |

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring/logging setup
- [ ] Error tracking enabled
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] API documentation updated
- [ ] Team access configured
- [ ] Disaster recovery plan ready
- [ ] Cost tracking enabled

---

**Questions?** Check the main README.md or API.md
