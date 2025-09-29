# Google OAuth Setup Guide

## Overview

This guide explains how to set up Google OAuth authentication for the BurnBlack platform.

## Prerequisites

- Google Cloud Console account
- Access to Google Cloud Console
- Domain or localhost setup for testing

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your project ID

## Step 2: Enable Google+ API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Configure the following:

### Authorized JavaScript origins:

```
http://localhost:3000
http://localhost:3002
https://yourdomain.com
```

### Authorized redirect URIs:

```
http://localhost:3002/api/auth/google/callback
https://yourdomain.com/api/auth/google/callback
```

## Step 4: Get Credentials

After creating the OAuth client, you'll get:

- **Client ID**: `your-google-client-id`
- **Client Secret**: `your-google-client-secret`

## Step 5: Update Environment Variables

Update your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3002/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Step 6: Test the Integration

1. Start your backend server:

   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:

   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the OAuth flow

## How It Works

### Backend Flow:

1. User clicks "Continue with Google"
2. Redirects to `/api/auth/google`
3. Google OAuth consent screen
4. User authorizes the app
5. Google redirects to `/api/auth/google/callback`
6. Backend processes the OAuth response
7. Creates/updates user in database
8. Generates JWT token
9. Redirects to frontend with token

### Frontend Flow:

1. User clicks Google button
2. Redirects to backend OAuth endpoint
3. After OAuth, redirects to `/auth/google/success`
4. Success page processes token and user data
5. Stores in localStorage
6. Redirects to appropriate dashboard

## Database Schema

The User model includes these Google OAuth fields:

```javascript
googleId: {
  type: DataTypes.STRING,
  allowNull: true,
  unique: true,
  field: 'google_id'
},
emailVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  field: 'email_verified'
},
lastLoginAt: {
  type: DataTypes.DATE,
  allowNull: true,
  field: 'last_login_at'
}
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for OAuth in production
2. **Client Secret**: Keep client secret secure, never expose in frontend
3. **Token Validation**: JWT tokens are validated on each request
4. **User Data**: Google provides verified email addresses
5. **Account Linking**: Existing users can link Google accounts

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**
   - Check authorized redirect URIs in Google Console
   - Ensure exact match including protocol and port

2. **"invalid_client"**
   - Verify Client ID and Secret in .env
   - Check if OAuth client is enabled

3. **"access_denied"**
   - User cancelled the OAuth flow
   - Check OAuth consent screen configuration

4. **Database errors**
   - Run migration: `node src/scripts/migrate.js migrate`
   - Check database connection

### Debug Steps:

1. Check backend logs for OAuth errors
2. Verify environment variables
3. Test OAuth flow step by step
4. Check browser network tab for redirects

## Production Deployment

For production:

1. Update OAuth client with production domains
2. Use HTTPS for all OAuth URLs
3. Set secure environment variables
4. Configure proper CORS settings
5. Test OAuth flow in production environment

## Support

For issues with Google OAuth setup:

1. Check Google Cloud Console documentation
2. Verify OAuth 2.0 configuration
3. Test with Google OAuth 2.0 Playground
4. Review backend and frontend logs
