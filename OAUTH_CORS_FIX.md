# ServiceNow OAuth CORS Fix

## Problem
The frontend application was experiencing CORS errors when trying to authenticate with ServiceNow OAuth directly from the browser:
```
Access to fetch at 'https://nextgenbpmnp1.service-now.com/oauth_token.do' from origin 'https://claims-assistant-beta.vercel.app' has been blocked by CORS policy
```

## Solution
Created a backend API proxy to handle OAuth token exchanges server-side, eliminating CORS issues.

## Changes Made

### 1. Backend API (`claims-portal/api/servicenow-oauth.js`)
- **Enhanced error handling**: Better logging and error messages
- **Improved body parsing**: Handles both string and object request bodies
- **CORS headers**: Set appropriate CORS headers for all responses
- **Request forwarding**: Properly forwards OAuth requests to ServiceNow

### 2. Frontend Service (`claims-portal/src/services/api/serviceNowService.js`)
- **Updated OAuth URL**: Changed to use backend API endpoint in production
  - Development: `/servicenow-oauth` (Vite proxy)
  - Production: `/api/servicenow-oauth` (Vercel serverless function)

### 3. Vercel Configuration (`vercel.json`)
- **Added rewrite rule**: Routes `/api/servicenow-oauth` to the serverless function
  ```json
  {
    "rewrites": [
      {
        "source": "/api/servicenow-oauth",
        "destination": "/claims-portal/api/servicenow-oauth"
      }
    ]
  }
  ```

## How It Works

### Development (Local)
1. Frontend calls `/servicenow-oauth`
2. Vite proxy forwards to ServiceNow
3. Response returned to frontend

### Production (Vercel)
1. Frontend calls `/api/servicenow-oauth`
2. Vercel routes to serverless function
3. Serverless function forwards to ServiceNow (server-to-server, no CORS)
4. Response returned to frontend

## Flow Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │ ──────> │  Backend API     │ ──────> │ ServiceNow  │
│  (Frontend) │         │  /api/sns-oauth  │         │    OAuth    │
└─────────────┘ <────── └──────────────────┘ <────── └─────────────┘
                           (No CORS issues)
```

## Testing

### Deploy to Vercel
```bash
vercel --prod
```

### Test OAuth Flow
1. Navigate to your application
2. Click "Connect to ServiceNow" button
3. Complete ServiceNow OAuth authorization
4. Should redirect back without CORS errors

## Environment Variables Required

Make sure these are set in your Vercel project settings:

```
VITE_SERVICENOW_URL=https://nextgenbpmnp1.service-now.com
VITE_SERVICENOW_CLIENT_ID=your_client_id
VITE_SERVICENOW_CLIENT_SECRET=your_client_secret
VITE_OAUTH_REDIRECT_URI=https://your-app.vercel.app
```

## Benefits
- ✅ No CORS configuration needed in ServiceNow
- ✅ Secure: Client secret never exposed to browser
- ✅ Works in both development and production
- ✅ Proper error handling and logging
- ✅ Standard OAuth 2.0 Authorization Code flow

## Notes
- The backend API logs all requests for debugging
- Check Vercel function logs if issues persist
- OAuth tokens are still stored in sessionStorage on the frontend
