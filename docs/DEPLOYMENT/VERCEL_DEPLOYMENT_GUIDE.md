# Vercel Deployment Guide - Burnblack ITR Platform

This guide provides step-by-step instructions for deploying the Burnblack ITR platform to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Vercel Account Setup](#vercel-account-setup)
4. [Project Configuration](#project-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Setup (Supabase)](#database-setup-supabase)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Tasks](#post-deployment-tasks)
9. [Domain Configuration](#domain-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting the deployment process, ensure you have:

- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ GitHub/GitLab/Bitbucket account with the project repository
- ✅ Supabase account and project set up
- ✅ All environment variables documented
- ✅ Domain name (optional, for custom domain)
- ✅ Node.js and npm installed locally (for testing)

---

## Pre-Deployment Checklist

### 1. Code Readiness

- [ ] All code changes committed to repository
- [ ] All tests passing locally
- [ ] No console.log statements in production code
- [ ] Error handling properly implemented
- [ ] API rate limiting configured
- [ ] CORS settings configured correctly

### 2. Database Readiness

- [ ] Supabase project created and active
- [ ] Database schema verified and up-to-date
- [ ] All migrations applied
- [ ] Database indexes created
- [ ] Connection strings ready

### 3. Environment Variables

- [ ] All environment variables documented
- [ ] Sensitive keys secured
- [ ] API keys generated for production
- [ ] OAuth credentials configured

---

## Vercel Account Setup

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Vercel to access your repositories

### Step 2: Install Vercel CLI (Optional)

For local testing and CLI deployments:

```bash
npm install -g vercel
```

Verify installation:

```bash
vercel --version
```

---

## Project Configuration

### Monorepo Configuration (Frontend + Backend)

For deploying both frontend and backend together, create `vercel.json` at the **root** of your project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "includeFiles": [
          "backend/src/**",
          "backend/package.json"
        ]
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/health",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/(.*\\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico))",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "dest": "frontend/build/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/index.html"
    }
  ],
  "functions": {
    "backend/api/index.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "regions": ["bom1"],
  "env": {
    "NODE_ENV": "production"
  },
  "installCommand": "cd backend && npm install && cd ../frontend && npm install"
}
```

### Backend Serverless Entry Point

Create `backend/api/index.js` file:

```javascript
// =====================================================
// VERCEL SERVERLESS FUNCTION ENTRY POINT
// This file is used by Vercel to handle API requests
// =====================================================

// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('../src/app');

// Export the Express app for Vercel
module.exports = app;
```

**Note:** This configuration deploys both frontend and backend together. If you need to separate them in the future, you can create two separate Vercel projects.

---

## Environment Variables

### Frontend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
REACT_APP_ENVIRONMENT=production

# Authentication
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_OAUTH_REDIRECT_URI=https://your-frontend-domain.vercel.app/auth/callback

# Feature Flags
REACT_APP_FEATURE_ERI_LIVE=true
REACT_APP_FEATURE_PAYMENTS=true
REACT_APP_FEATURE_NOTIFICATIONS=true

# Analytics (if applicable)
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Backend Environment Variables

Add these to your backend Vercel project:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=your-supabase-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_SSL=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your-session-secret-key
SHARE_TOKEN_SECRET=your-share-token-secret
PASSWORD_RESET_SECRET=your-password-reset-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ERI Integration
ERI_API_BASE_URL=https://eri.incometax.gov.in/api
ERI_API_KEY=your-eri-api-key
FEATURE_ERI_LIVE=true

# SurePass API (Aadhaar/PAN Verification)
SUREPASS_API_KEY=your-surepass-api-key
SUREPASS_BASE_URL=https://api.surepass.io

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Service (SendGrid/SES)
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Burnblack ITR

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Redis (Optional, for caching/sessions)
REDIS_URL=your-redis-url
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn (optional)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Variable Setup in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for:
   - **Production**
   - **Preview** (for pull request previews)
   - **Development** (optional)

4. Click **Save** after adding each variable

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned (~2 minutes)

### Step 2: Run Database Migrations

After deployment, you'll need to run migrations. Two options:

**Option A: Via Vercel Serverless Function**

Create a migration endpoint (one-time use, then disable):

```javascript
// backend/src/routes/admin.js
router.post('/run-migrations', authenticateAdmin, async (req, res) => {
  // Run migrations script
  // DISABLE THIS AFTER FIRST RUN
});
```

**Option B: Via Local Machine or CI/CD**

1. Install dependencies locally
2. Set `DATABASE_URL` environment variable
3. Run:

```bash
cd backend
npm run db:migrate-pending
npm run db:add-indexes
```

### Step 3: Verify Database Connection

1. Test connection from Vercel environment
2. Verify all tables exist
3. Check indexes are created

---

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended for First Deployment)

#### Frontend Deployment

1. **Import Project**
   - Go to Vercel Dashboard
   - Click **Add New Project**
   - Select your Git repository
   - Choose the repository containing your frontend

2. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   - Add all frontend environment variables (see above)
   - Set them for Production environment

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (~3-5 minutes)
   - Copy the deployment URL

#### Backend Deployment

1. **Import Project**
   - Go to Vercel Dashboard
   - Click **Add New Project**
   - Select the same repository (or separate backend repo)

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Create `vercel.json` in backend root**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

4. **Add Environment Variables**
   - Add all backend environment variables
   - Set them for Production environment

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Copy the deployment URL

6. **Update Frontend Environment Variables**
   - Go to frontend project settings
   - Update `REACT_APP_API_URL` to backend deployment URL
   - Redeploy frontend

### Method 2: Deploy via Vercel CLI

#### Initial Setup

1. **Login to Vercel**:

```bash
vercel login
```

2. **Link Project**:

```bash
cd frontend
vercel link
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first time)
- Project name: `burnblack-frontend`
- Directory: `./`

3. **Deploy to Production**:

```bash
vercel --prod
```

For backend:

```bash
cd backend
vercel link
# Follow same steps
vercel --prod
```

### Method 3: Automatic Deployments via Git

1. **Connect Repository** (if not already connected)
   - Project Settings → Git
   - Connect your repository

2. **Configure Git Integration**
   - **Production Branch**: `main` or `master`
   - **Preview Deployments**: Enable for pull requests
   - **Auto-deploy**: Enabled

3. **Push to Repository**
   - Every push to `main` triggers production deployment
   - Pull requests create preview deployments

---

## Post-Deployment Tasks

### 1. Run Database Migrations

```bash
# Via SSH/Remote access or API endpoint
cd backend
DATABASE_URL=your-production-db-url npm run db:migrate-pending
DATABASE_URL=your-production-db-url npm run db:add-indexes
```

### 2. Verify Database Connection

```bash
DATABASE_URL=your-production-db-url npm run db:test-operations
```

### 3. Test API Endpoints

Test critical endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Test authentication
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 4. Verify Frontend

1. Visit your frontend URL
2. Test login/logout
3. Verify API calls work
4. Check console for errors

### 5. Create Admin User

```bash
# Via API or migration script
DATABASE_URL=your-production-db-url npm run admin:create
```

### 6. Configure CORS

Ensure backend allows frontend origin:

```javascript
// backend/src/middleware/cors.js
const allowedOrigins = [
  'https://your-frontend.vercel.app',
  'https://www.yourdomain.com',
];
```

### 7. Set Up Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Configure Sentry (if using)
- **Logging**: Check Vercel function logs

---

## Domain Configuration

### Step 1: Add Domain in Vercel

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions

### Step 2: Configure DNS

Add these DNS records with your domain provider:

**For Frontend:**
```
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com
```

**For Backend API (if separate domain):**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

**Or use A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. Wait 1-24 hours for certificate generation.

### Step 4: Update Environment Variables

After domain setup, update:
- `FRONTEND_URL` in backend
- `REACT_APP_API_URL` in frontend (if backend has custom domain)

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found errors

**Solution**:
1. Check `package.json` dependencies
2. Ensure all dependencies are in `dependencies`, not `devDependencies`
3. Clear Vercel build cache: Settings → Clear Build Cache

**Issue**: Build timeout

**Solution**:
1. Optimize build process
2. Split into smaller builds
3. Use Vercel Pro plan for longer build times

### Database Connection Issues

**Issue**: Cannot connect to database

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check Supabase IP allowlist (should allow all or Vercel IPs)
3. Verify SSL connection: `DB_SSL=true`
4. Test connection locally with production URL

### Environment Variables Not Working

**Issue**: Environment variables not accessible

**Solution**:
1. Verify variables are set for correct environment (Production/Preview)
2. Redeploy after adding variables
3. Check variable names match code exactly
4. Restart function instances

### CORS Errors

**Issue**: CORS errors in browser

**Solution**:
1. Update backend CORS settings
2. Add frontend URL to allowed origins
3. Verify `Access-Control-Allow-Origin` header
4. Check preflight OPTIONS requests

### API 504 Timeout

**Issue**: API requests timeout

**Solution**:
1. Check function timeout limits (Hobby: 10s, Pro: 60s)
2. Optimize database queries
3. Implement request timeouts
4. Consider upgrading to Pro plan

### Function Cold Starts

**Issue**: First request is slow

**Solution**:
1. Keep functions warm with cron jobs
2. Use Vercel Pro plan (better performance)
3. Optimize dependencies
4. Implement connection pooling

---

## Best Practices

### 1. Security

- ✅ Never commit `.env` files
- ✅ Use Vercel environment variables
- ✅ Rotate secrets regularly
- ✅ Enable 2FA on Vercel account
- ✅ Use HTTPS everywhere
- ✅ Implement rate limiting
- ✅ Validate all inputs

### 2. Performance

- ✅ Enable Vercel Edge Caching
- ✅ Use CDN for static assets
- ✅ Optimize images
- ✅ Implement lazy loading
- ✅ Use database connection pooling
- ✅ Add proper indexes

### 3. Monitoring

- ✅ Enable Vercel Analytics
- ✅ Set up error tracking (Sentry)
- ✅ Monitor function logs
- ✅ Track API response times
- ✅ Set up uptime monitoring

### 4. CI/CD

- ✅ Use preview deployments for PRs
- ✅ Run tests before deployment
- ✅ Use separate environments
- ✅ Automate deployments from main branch

---

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Database indexes created
- [ ] Admin user created
- [ ] API endpoints tested
- [ ] Frontend tested
- [ ] CORS configured
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Error tracking set up
- [ ] Monitoring configured
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## Quick Reference

### Deployment URLs

After deployment, your URLs will be:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend-project.vercel.app`

### Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel list

# Inspect deployment
vercel inspect [deployment-url]
```

### Vercel Dashboard

- **Deployments**: View all deployments
- **Settings**: Configure project settings
- **Environment Variables**: Manage env vars
- **Domains**: Configure custom domains
- **Analytics**: View performance metrics
- **Logs**: View function logs

---

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

## Additional Resources

- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

---

**Last Updated**: 2024-01-XX
**Maintained By**: Burnblack Development Team

