# 🚀 Quick Start - Google Authentication

## Prerequisites
- Google Cloud Console account
- Backend API running on http://localhost:5114
- Node.js and npm installed

## 5-Minute Setup

### Step 1: Get Google Client ID (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select project
3. Navigate to: **APIs & Services** → **Credentials**
4. Click: **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen (if first time)
6. Application type: **Web application**
7. Add Authorized redirect URI:
   ```
   http://localhost:3000/auth/callback
   ```
8. Click **Create**
9. Copy the **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### Step 2: Configure Environment (1 minute)

Create `.env.local` in the frontend root:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=paste_your_client_id_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:5114
```

### Step 3: Start Applications (2 minutes)

**Terminal 1 - Backend:**
```bash
cd BACKEND/ArenaOps.AuthService/ArenaOps.AuthService.API
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd FRONTEND/arenaops-web
npm install  # if first time
npm run dev
```

### Step 4: Test (30 seconds)

1. Open browser: http://localhost:3000/login
2. Click the **Google button** (Chrome icon)
3. Sign in with Google
4. You should be redirected to dashboard!

---

## Troubleshooting

### "redirect_uri_mismatch" error?
→ Make sure the redirect URI in Google Console is **exactly**: `http://localhost:3000/auth/callback`

### Google button not working?
→ Check browser console for errors
→ Verify `.env.local` file exists and has correct Client ID

### Backend connection error?
→ Ensure backend is running on port 5114
→ Check CORS is enabled in backend

---

## What's Next?

✅ **Working?** Great! Read `GOOGLE_AUTH_SETUP.md` for advanced configuration

✅ **Need Help?** Check `IMPLEMENTATION_SUMMARY.md` for detailed architecture

✅ **Production Deploy?** Review security checklist in `GOOGLE_AUTH_SETUP.md`

---

## File Structure

```
FRONTEND/arenaops-web/
├── .env.local                    ← Create this!
├── .env.local.example            ← Template
├── QUICK_START.md                ← You are here
├── GOOGLE_AUTH_SETUP.md          ← Full documentation
├── IMPLEMENTATION_SUMMARY.md     ← Architecture details
└── src/
    ├── app/
    │   ├── (auth)/login/         ← Login page
    │   └── auth/callback/        ← OAuth callback
    ├── components/auth/          ← Auth forms
    ├── services/                 ← API services
    └── app/store/                ← Redux store
```

---

## Quick Reference

### Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:5114
```

### Backend Endpoint
```
POST http://localhost:5114/api/auth/google
Body: { code: string, redirectUri: string }
```

### Redirect URI
```
Development: http://localhost:3000/auth/callback
Production: https://yourdomain.com/auth/callback
```

---

**Ready to go!** 🎉

If you see the Google login button and can click it, you're all set!
