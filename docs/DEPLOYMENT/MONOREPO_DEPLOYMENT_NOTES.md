# Monorepo Deployment Notes

## Current Setup

The project is configured to deploy both frontend and backend together on Vercel as a monorepo.

## File Structure

```
.
├── vercel.json              # Root Vercel configuration
├── backend/
│   ├── api/
│   │   └── index.js        # Vercel serverless entry point
│   ├── src/
│   │   └── app.js          # Express app
│   └── package.json
└── frontend/
    ├── package.json
    └── build/               # Generated after build
```

## How It Works

1. **Backend**: Vercel uses `backend/api/index.js` as the serverless function entry point
2. **Frontend**: Vercel builds the React app and serves static files
3. **Routing**: 
   - `/api/*` → Backend serverless function
   - `/*` → Frontend static files

## Environment Variables

All environment variables are set in Vercel Dashboard → Project Settings → Environment Variables.

**Important**: 
- Frontend variables must be prefixed with `REACT_APP_`
- Backend variables use standard names
- `REACT_APP_API_URL` should be set to `/api` (relative path)

## Future Separation

If you need to separate frontend and backend in the future:

1. Create two separate Vercel projects
2. Deploy frontend with its own `vercel.json` in `frontend/` directory
3. Deploy backend with its own `vercel.json` in `backend/` directory
4. Update `REACT_APP_API_URL` to point to the backend project URL

## Build Process

1. Vercel installs dependencies for both frontend and backend
2. Backend is packaged as a serverless function
3. Frontend is built using `npm run build`
4. Both are deployed together

## Function Configuration

When using the `builds` API (version 2), function settings like `maxDuration` and `memory` cannot be set in `vercel.json`. Configure these in the Vercel Dashboard:

1. Go to **Project Settings** → **Functions**
2. Set **Max Duration** (default: 10s for Hobby, 60s for Pro)
3. Set **Memory** (default: 1024MB)

Or upgrade to Vercel Pro plan for longer execution times (up to 60s).

## Troubleshooting

- **Build fails**: Check that both `backend/package.json` and `frontend/package.json` exist
- **API not working**: Verify `backend/api/index.js` exists and exports the app correctly
- **Frontend not loading**: Check that `frontend/build` directory is generated during build
- **Environment variables**: Ensure all required variables are set in Vercel dashboard
- **Function timeout**: Increase max duration in Vercel Dashboard → Functions (requires Pro plan for >10s)

