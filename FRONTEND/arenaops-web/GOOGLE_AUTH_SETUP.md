# Google Authentication Setup Guide

## Overview
This implementation uses **Google OAuth 2.0 Authorization Code Flow** for secure authentication in the ArenaOps platform.

## Architecture

### Flow Diagram
```
User → Login Page → Google OAuth → Callback Page → Backend API → Dashboard
```

### Tech Stack
- **Next.js 14+** (App Router)
- **TypeScript**
- **Redux Toolkit** (State Management)
- **Axios** (HTTP Client)
- **GSAP** (Animations)
- **Tailwind CSS** (Styling)

---

## Setup Instructions

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: ArenaOps
   - Support email: your-email@example.com
   - Scopes: `openid`, `email`, `profile`
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (Development)
     - `https://yourdomain.com/auth/callback` (Production)
7. Copy the **Client ID** (DO NOT share Client Secret on frontend)

### 2. Environment Variables

Create `.env.local` file in the project root:

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5114
```

**Important:** Never commit `.env.local` to version control!

### 3. Backend API Requirements

Your backend must implement:

**Endpoint:** `POST /api/auth/google`

**Request:**
```json
{
  "code": "authorization_code_from_google",
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "userId": "user_id",
    "roles": ["User"],
    "isNewUser": true
  },
  "message": "Login successful",
  "error": null
}
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Login page with Google button
│   └── auth/
│       └── callback/
│           └── page.tsx           # OAuth callback handler
├── components/
│   └── auth/
│       ├── LoginForm.tsx          # Login form component
│       └── Registerform.tsx       # Register form component
├── services/
│   ├── axios.ts                   # Axios instance with interceptors
│   └── authService.ts             # Authentication API calls
└── app/store/
    └── authSlice.ts               # Redux auth state management
```

---

## Implementation Details

### 1. Login Page (`LoginForm.tsx`)

**Google Login Button:**
- Initiates OAuth flow
- Redirects to Google's authorization URL
- Includes required scopes: `openid email profile`
- Uses `access_type=offline` for refresh token
- Uses `prompt=consent` to ensure refresh token is always returned

**Function:**
```typescript
const handleGoogleLogin = () => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin + "/auth/callback";
  const scope = "openid email profile";
  const responseType = "code";
  const accessType = "offline";
  const prompt = "consent";
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=${accessType}&prompt=${prompt}`;
  
  window.location.href = authUrl;
};
```

### 2. Callback Page (`app/auth/callback/page.tsx`)

**Responsibilities:**
- Extract authorization code from URL
- Display loading animation
- Call backend API with code
- Handle success/error states
- Redirect to dashboard or login

**Features:**
- GSAP animations for smooth UX
- Glassmorphism design
- Error handling with auto-redirect
- New user detection for onboarding

### 3. Redux Auth Slice (`authSlice.ts`)

**Google Login Thunk:**
```typescript
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (payload: { code: string; redirectUri: string }, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(payload.code, payload.redirectUri);
      if (response.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      } else {
        return rejectWithValue(response.message || "Google login failed");
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Google login failed");
    }
  }
);
```

### 4. Axios Configuration (`axios.ts`)

**Features:**
- Automatic access token attachment
- Refresh token interceptor
- Request queuing during token refresh
- Auto-redirect on auth failure

**Token Refresh Flow:**
1. API returns 401 Unauthorized
2. Interceptor catches error
3. Calls `/api/auth/refresh` with refresh token
4. Updates tokens in localStorage
5. Retries original request with new token
6. If refresh fails, redirects to login

---

## Security Considerations

### ✅ Best Practices Implemented

1. **No Client Secret on Frontend**
   - Only Client ID is exposed
   - Client Secret stays on backend

2. **Authorization Code Flow**
   - More secure than Implicit Flow
   - Backend validates the code

3. **Token Storage**
   - Currently using localStorage (for development)
   - **TODO:** Migrate to HttpOnly cookies for production

4. **HTTPS Required**
   - Google OAuth requires HTTPS in production
   - Use SSL certificates for production deployment

5. **CSRF Protection**
   - Implement state parameter for CSRF protection
   - **TODO:** Add state validation in callback

### 🔒 Production Security Checklist

- [ ] Migrate to HttpOnly cookies for token storage
- [ ] Implement CSRF state parameter
- [ ] Add rate limiting on backend
- [ ] Enable CORS only for specific domains
- [ ] Use secure, sameSite cookies
- [ ] Implement token rotation
- [ ] Add session timeout
- [ ] Enable 2FA for sensitive operations

---

## Testing

### Local Testing

1. Start backend:
```bash
cd BACKEND/ArenaOps.AuthService/ArenaOps.AuthService.API
dotnet run
```

2. Start frontend:
```bash
cd FRONTEND/arenaops-web
npm run dev
```

3. Navigate to: `http://localhost:3000/login`
4. Click Google button
5. Authorize with Google account
6. Should redirect to dashboard

### Test Scenarios

- ✅ Successful login with existing user
- ✅ Successful login with new user
- ✅ Error handling (invalid code)
- ✅ Error handling (backend down)
- ✅ Token refresh on 401
- ✅ Auto-redirect on auth failure

---

## Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** Ensure redirect URI in Google Console exactly matches the one in code.

### Issue: "invalid_client"
**Solution:** Check that Client ID is correct in `.env.local`.

### Issue: "access_denied"
**Solution:** User cancelled authorization. This is normal behavior.

### Issue: Callback page shows error
**Solution:** Check browser console and network tab for API errors.

### Issue: Token refresh not working
**Solution:** Ensure backend `/api/auth/refresh` endpoint is implemented correctly.

---

## Future Enhancements

1. **HttpOnly Cookie Storage**
   - Implement secure cookie-based auth
   - Remove localStorage dependency

2. **Social Login Expansion**
   - Add GitHub OAuth
   - Add Microsoft OAuth

3. **Enhanced Security**
   - Implement CSRF state parameter
   - Add device fingerprinting
   - Implement suspicious login detection

4. **User Experience**
   - Add "Remember Me" functionality
   - Implement session management UI
   - Add login history

---

## API Reference

### Google OAuth Endpoints

**Authorization URL:**
```
https://accounts.google.com/o/oauth2/v2/auth
```

**Token Exchange URL (Backend Only):**
```
https://oauth2.googleapis.com/token
```

### Backend Endpoints

**Google Login:**
```
POST /api/auth/google
Body: { code, redirectUri }
Response: { success, data: { accessToken, refreshToken, userId, roles, isNewUser }, message, error }
```

**Refresh Token:**
```
POST /api/auth/refresh
Body: { refreshToken }
Response: { success, data: { accessToken, refreshToken, ... }, message, error }
```

**Logout:**
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Body: { refreshToken }
Response: { success, message }
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check backend logs
4. Verify Google Cloud Console configuration

---

## License

This implementation is part of the ArenaOps platform.
