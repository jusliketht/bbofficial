---
name: Fix Vercel 404 Routing Issue
overview: Fix the 404 errors for both API and frontend by correcting the route configuration in vercel.json. The issue is that `@vercel/static-build` serves files differently than expected, and routes need to match Vercel's actual file structure.
todos:
  - id: update_vercel_config
    content: Update vercel.json to use rewrites for frontend static files while keeping explicit routes for API endpoints
    status: completed
  - id: test_deployment
    content: Deploy and test both API (/api/health) and frontend (/) endpoints to verify routing works
    status: completed
    dependencies:
      - update_vercel_config
  - id: verify_static_files
    content: Verify static assets (JS, CSS) load correctly by checking browser network tab
    status: completed
    dependencies:
      - test_deployment
  - id: test_spa_routing
    content: Test client-side routing (e.g., navigate to /dashboard) to ensure React Router works
    status: completed
    dependencies:
      - test_deployment
---

# Fix Vercel 404 Routing Issue

## Problem Analysis

Both API (`/api/health`) and frontend (`/`) are returning 404 errors, even though the build completes successfully. This indicates a routing configuration issue in `vercel.json`.

When using `@vercel/static-build` with `src: "frontend/package.json"` and `distDir: "build"`, Vercel:

1. Builds in the `frontend/` directory
2. Outputs to `frontend/build/` (relative to repo root)
3. Serves files from a flattened structure in `/vercel/output`

The current routes point to `frontend/build/$1`, but Vercel's actual output structure may be different.

## Solution Approach

### Option 1: Use Rewrites Instead of Routes (Recommended)

Vercel's `rewrites` are more reliable for static builds. They work better with `@vercel/static-build` because they handle the file structure automatically.

### Option 2: Fix Route Destinations

If routes are preferred, the `dest` paths need to match Vercel's actual output structure, which may be different from the source structure.

## Implementation Plan

### Step 1: Update vercel.json with Rewrites

Replace the current `routes` configuration with `rewrites` for the frontend, while keeping explicit routes for API:

**File**: `vercel.json`

- Keep API routes as-is (they should work once routing is fixed)
- Replace frontend routes with rewrites
- Use rewrites to handle static files and SPA routing

### Step 2: Test Configuration

After updating:

1. Commit and push changes
2. Monitor Vercel deployment
3. Test endpoints:

   - `GET /api/health` (should return JSON)
   - `GET /` (should return HTML)
   - `GET /static/js/main.*.js` (should return JS file)

### Step 3: Alternative - Verify Build Output Structure

If rewrites don't work, we need to:

1. Check Vercel's actual output structure
2. Adjust route `dest` paths to match
3. Consider using `outputDirectory` in build config

## Technical Details

### Current Configuration Issues

1. **Route Destinations**: `frontend/build/$1` may not match Vercel's output structure
2. **Static File Routing**: The regex pattern may not catch all static files
3. **SPA Routing**: The catch-all route may not properly serve `index.html` for client-side routes

### Proposed Fix

Use `rewrites` which are more flexible and handle static builds better:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

But we need to keep explicit routes for API since it's a serverless function.

## Files to Modify

1. **`vercel.json`**: Update routing configuration

   - Replace frontend routes with rewrites
   - Keep API routes explicit
   - Ensure proper order

## Testing Checklist

- [ ] API endpoint returns 200: `curl https://bbofficialtech.vercel.app/api/health`
- [ ] Root URL returns HTML: `curl https://bbofficialtech.vercel.app/`
- [ ] Static files load: Check browser network tab for JS/CSS files
- [ ] Client-side routing works: Navigate to `/dashboard` or other routes
- [ ] No 404 errors in browser console

## Rollback Plan

If the fix doesn't work:

1. Revert to original route configuration
2. Try alternative: Use `outputDirectory` in build config
3. Consider separating frontend and backend into different Vercel projects

## Expected Outcome

After this fix:

- ✅ API endpoints work correctly
- ✅ Frontend loads at root URL
- ✅ Static assets (JS, CSS) load properly
- ✅ Client-side routing works (React Router)
- ✅ No 404 errors