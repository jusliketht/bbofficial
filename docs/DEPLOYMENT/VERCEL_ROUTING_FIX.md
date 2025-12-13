# Vercel Routing Configuration Fix

## Problem

Both API (`/api/health`) and frontend (`/`) were returning 404 errors after successful builds.

## Root Cause

The route configuration in `vercel.json` was pointing to `frontend/build/$1`, but when using `@vercel/static-build`, Vercel serves files from a different structure. The routes weren't matching the actual file locations.

## Solution

Updated `vercel.json` to use a hybrid approach:

1. **Routes** for API endpoints (explicit routing to serverless functions)
2. **Rewrites** for frontend SPA routing (catch-all to serve `index.html`)
3. **Headers** for static asset caching

### Key Changes

1. **Kept explicit routes for API**:
   ```json
   "routes": [
     { "src": "/api/(.*)", "dest": "backend/api/index.js" },
     { "src": "/health", "dest": "backend/api/index.js" }
   ]
   ```

2. **Added rewrites for SPA routing**:
   ```json
   "rewrites": [
     { "source": "/(.*)", "destination": "/index.html" }
   ]
   ```

3. **Added headers for static assets**:
   ```json
   "headers": [
     {
       "source": "/(.*\\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|json|map))",
       "headers": [
         { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
       ]
     }
   ]
   ```

## How It Works

1. **Routes are processed first**:
   - `/api/*` → `backend/api/index.js` (serverless function)
   - `/health` → `backend/api/index.js` (serverless function)

2. **Static files are served automatically**:
   - `@vercel/static-build` automatically serves files from `build/` directory
   - Files like `/static/js/main.js` are served directly from `frontend/build/static/js/main.js`

3. **Rewrites handle SPA routing**:
   - Any request not matching routes or static files is rewritten to `/index.html`
   - This allows React Router to handle client-side routing

4. **Headers are applied**:
   - Static assets get cache headers for optimal performance

## Testing

After deployment, test:

```bash
# API endpoint (should return JSON)
curl https://bbofficialtech.vercel.app/api/health

# Frontend root (should return HTML)
curl https://bbofficialtech.vercel.app/

# Static file (should return JS/CSS)
curl https://bbofficialtech.vercel.app/static/js/main.[hash].js

# Client-side route (should return HTML, React Router handles it)
curl https://bbofficialtech.vercel.app/dashboard
```

## Expected Behavior

- ✅ API endpoints work: `/api/*` routes to backend serverless function
- ✅ Frontend loads: `/` serves `index.html`
- ✅ Static assets load: JS, CSS, images served with proper caching
- ✅ SPA routing works: All routes serve `index.html`, React Router handles navigation
- ✅ No 404 errors

## Notes

- Routes are processed before rewrites
- Static files are automatically served by `@vercel/static-build`
- The catch-all rewrite ensures all non-API routes serve `index.html` for SPA routing
- Headers are applied to static assets for optimal caching

---

**Last Updated**: 2025-01-XX
**Version**: 1.0

