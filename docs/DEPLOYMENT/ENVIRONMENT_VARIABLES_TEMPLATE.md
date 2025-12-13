# Environment Variables Template

This document lists all required environment variables for the Burnblack ITR platform deployment.

## Frontend Environment Variables

Copy these to Vercel Dashboard → Settings → Environment Variables

```env
# ============================================
# API Configuration
# ============================================
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
REACT_APP_ENVIRONMENT=production

# ============================================
# Authentication
# ============================================
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_OAUTH_REDIRECT_URI=https://your-frontend-domain.vercel.app/auth/callback

# ============================================
# Feature Flags
# ============================================
REACT_APP_FEATURE_ERI_LIVE=true
REACT_APP_FEATURE_PAYMENTS=true
REACT_APP_FEATURE_NOTIFICATIONS=true
REACT_APP_FEATURE_OCR=true

# ============================================
# Analytics & Monitoring (Optional)
# ============================================
REACT_APP_ANALYTICS_ID=your-analytics-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

---

## Backend Environment Variables

```env
# ============================================
# Server Configuration
# ============================================
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# ============================================
# Database Configuration (Supabase)
# ============================================
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_SSL=true

# ============================================
# JWT & Authentication
# ============================================
JWT_SECRET=generate-a-strong-secret-min-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=generate-another-strong-secret-min-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# Session & Token Secrets
# ============================================
SESSION_SECRET=generate-a-strong-session-secret
SHARE_TOKEN_SECRET=generate-a-share-token-secret
PASSWORD_RESET_SECRET=generate-a-password-reset-secret

# ============================================
# OAuth Configuration
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# ERI Integration (Income Tax Portal)
# ============================================
ERI_API_BASE_URL=https://eri.incometax.gov.in/api
ERI_API_KEY=your-eri-api-key
FEATURE_ERI_LIVE=true

# ============================================
# SurePass API (Aadhaar/PAN Verification)
# ============================================
SUREPASS_API_KEY=your-surepass-api-key
SUREPASS_BASE_URL=https://api.surepass.io

# ============================================
# Payment Gateway (Razorpay)
# ============================================
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# ============================================
# Email Service
# ============================================
EMAIL_SERVICE_API_KEY=your-sendgrid-or-ses-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Burnblack ITR
EMAIL_SERVICE_PROVIDER=sendgrid
# Options: sendgrid, ses, nodemailer

# ============================================
# AWS S3 (File Storage)
# ============================================
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_S3_ENDPOINT=s3.amazonaws.com

# ============================================
# Redis (Optional - for caching/sessions)
# ============================================
REDIS_URL=redis://default:password@host:port
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_ENABLED=false

# ============================================
# Logging & Monitoring
# ============================================
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# File Upload Limits
# ============================================
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

---

## How to Generate Secrets

### JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Password Reset Secret

```bash
# Using OpenSSL
openssl rand -base64 32
```

---

## Environment-Specific Values

### Development
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
FEATURE_ERI_LIVE=false
LOG_LEVEL=debug
```

### Staging
```env
NODE_ENV=staging
FRONTEND_URL=https://staging.yourdomain.com
REACT_APP_API_URL=https://api-staging.yourdomain.com/api
FEATURE_ERI_LIVE=false
LOG_LEVEL=info
```

### Production
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com/api
FEATURE_ERI_LIVE=true
LOG_LEVEL=warn
```

---

## Security Checklist

- [ ] All secrets are randomly generated (not hardcoded)
- [ ] Secrets are different for each environment
- [ ] No secrets committed to Git
- [ ] Secrets are stored in Vercel environment variables
- [ ] Access to environment variables is restricted
- [ ] Regular secret rotation scheduled
- [ ] Backup of secrets stored securely

---

## Quick Setup Script

Save this as `setup-env.sh` and run it to generate secrets:

```bash
#!/bin/bash

echo "# Generated Environment Variables"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "SHARE_TOKEN_SECRET=$(openssl rand -hex 32)"
echo "PASSWORD_RESET_SECRET=$(openssl rand -base64 32)"
```

Run: `chmod +x setup-env.sh && ./setup-env.sh`

---

**Important**: Never commit this file with actual values to your repository!

