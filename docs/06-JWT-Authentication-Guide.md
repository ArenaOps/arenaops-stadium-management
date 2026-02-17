# ArenaOps Auth Service — JWT Authentication Guide

> **For the Team** — How JWT authentication works in our Auth Service.

---

## 1. Overview

ArenaOps uses **JWT (JSON Web Token)** with **RSA-256** signing for stateless authentication across microservices.

| Component | Details |
|-----------|---------|
| **Algorithm** | RS256 (RSA + SHA-256) |
| **Access Token** | JWT — expires in **30 minutes** |
| **Refresh Token** | Opaque random string — expires in **7 days** |
| **Key Storage** | RSA private key at `Keys/rsa-private.key` (auto-generated) |
| **Framework** | ASP.NET Core 8 + `Microsoft.AspNetCore.Authentication.JwtBearer` |

---

## 2. Token Types

### Access Token (JWT)
- **Purpose:** Sent with every API request to prove identity.
- **Format:** `eyJhbGciOiJSUzI1NiIs...` (Base64-encoded JSON)
- **Storage (Backend):** ❌ NOT stored in DB — stateless.
- **Storage (Frontend):** In-memory (React state) — discarded on page close.
- **Validation:** Server checks RSA signature + expiry. No DB lookup needed.

### Refresh Token
- **Purpose:** Used to get a NEW access token when the old one expires.
- **Format:** Random Base64 string (64 bytes)
- **Storage (Backend):** ✅ Stored in `RefreshTokens` table in SQL Server.
- **Storage (Frontend):** `localStorage` or `HttpOnly cookie`.
- **Validation:** Server looks it up in the DB.

---

## 3. JWT Claims (What's Inside the Token)

```json
{
  "sub": "56688764-3c0b-f111-bfa3-00155dd77908",
  "email": "user@example.com",
  "jti": "a45d5760-c154-425b-a7e1-295adfb3b75e",
  "fullName": "Test User",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User",
  "nbf": 1771306435,
  "exp": 1771308235,
  "iss": "ArenaOps",
  "aud": "ArenaOps"
}
```

| Claim | Purpose |
|-------|---------|
| `sub` | User ID (GUID) |
| `email` | User's email address |
| `jti` | Unique token ID — used for blacklisting on logout |
| `fullName` | Display name |
| `role` | User's role — used by `[Authorize(Roles = "Admin")]` |
| `nbf` | "Not Before" — token is invalid before this time |
| `exp` | Expiry — token is invalid after this time (30 min from creation) |
| `iss` | Issuer — must be `ArenaOps` |
| `aud` | Audience — must be `ArenaOps` |

---

## 4. Authentication Flow

```
┌──────────────┐                              ┌──────────────┐
│   FRONTEND   │                              │   BACKEND    │
│  (Next.js)   │                              │ (Auth API)   │
└──────┬───────┘                              └──────┬───────┘
       │                                             │
  ①  POST /api/auth/login                            │
       │── { email, password } ─────────────────────►│
       │                                             │ Verify credentials
       │                                             │ Generate JWT + Refresh Token
       │                                             │ Save refresh token in DB
       │◄── { accessToken, refreshToken } ──────────│
       │                                             │
  ②  Store tokens                                    │
       │  accessToken  → React state (memory)        │
       │  refreshToken → localStorage                │
       │                                             │
  ③  Make API calls                                  │
       │── GET /api/stadiums ───────────────────────►│
       │   Authorization: Bearer <accessToken>       │ Check RSA signature ✅
       │◄── 200 OK { data } ───────────────────────│
       │                                             │
  ④  Access token expires (30 min)                   │
       │── GET /api/stadiums ───────────────────────►│
       │   Authorization: Bearer <expiredToken>      │ JWT expired ❌
       │◄── 401 Unauthorized ──────────────────────│
       │                                             │
  ⑤  Auto-refresh                                    │
       │── POST /api/auth/refresh ─────────────────►│
       │   { refreshToken: "abc..." }                │ Find in DB ✅
       │                                             │ Delete old, create new pair
       │◄── { accessToken, refreshToken } ──────────│
       │                                             │
  ⑥  Store new tokens → retry failed request         │
       │── GET /api/stadiums ───────────────────────►│
       │   Authorization: Bearer <newAccessToken>    │ Works ✅
       │◄── 200 OK { data } ───────────────────────│
       │                                             │
  ⑦  Logout                                          │
       │── POST /api/auth/logout ──────────────────►│
       │   Authorization: Bearer <accessToken>       │ Blacklist JWT's jti
       │   { refreshToken: "abc..." }                │ Delete refresh token from DB
       │◄── 200 OK "Logged out" ───────────────────│
       │                                             │
  ⑧  After logout — access token is DEAD             │
       │── GET /api/stadiums ───────────────────────►│
       │   Authorization: Bearer <blacklistedToken>  │ jti is blacklisted ❌
       │◄── 401 TOKEN_REVOKED ─────────────────────│
```

---

## 5. Token Blacklisting (Immediate Logout)

By default, JWTs are stateless — the server can't "revoke" them until they expire. We solve this with an **in-memory blacklist**.

### How It Works:
1. On logout → the JWT's `jti` (unique ID) is added to an in-memory blacklist.
2. **Every request** → middleware checks if the `jti` is blacklisted.
3. If blacklisted → `401 TOKEN_REVOKED` immediately.
4. Expired entries are auto-cleaned every 5 minutes.

### Code Components:
| File | Purpose |
|------|---------|
| `ITokenBlacklistService.cs` | Interface — `BlacklistToken()` + `IsBlacklisted()` |
| `InMemoryTokenBlacklistService.cs` | ConcurrentDictionary + Timer cleanup |
| `TokenBlacklistMiddleware.cs` | Runs after `UseAuthentication()`, before `UseAuthorization()` |

### ⚠️ Limitation:
In-memory blacklist is **per-instance**. If you scale to multiple servers, replace with **Redis**.

---

## 6. Roles & Authorization

### Seeded Roles (in DB):
| RoleId | Name |
|--------|------|
| 1 | `Admin` |
| 2 | `StadiumOwner` |
| 3 | `Organizer` |
| 4 | `User` |

### Role Assignment:
- **Registration** → Always gets `User` role (client can't choose for security).
- **Stadium Manager** → Admin creates via `POST /api/auth/stadium-manager` → gets `StadiumOwner` role.
- **Admin** → Must be assigned directly in the DB.

### Using Roles in Controllers:
```csharp
[Authorize]                      // Any authenticated user
[Authorize(Roles = "Admin")]     // Admin only
[Authorize(Roles = "Admin,StadiumOwner")]  // Admin OR StadiumOwner
[AllowAnonymous]                 // No auth needed
```

---

## 7. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/auth/register` | ❌ | Register (always gets "User" role) |
| POST | `/api/auth/login` | ❌ | Login with email/password |
| POST | `/api/auth/google` | ❌ | Google OAuth login |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| POST | `/api/auth/logout` | 🔒 | Logout (blacklists JWT + deletes refresh token) |
| POST | `/api/auth/stadium-manager` | 🔒 Admin | Create Stadium Manager account |
| GET | `/api/auth/.well-known/jwks` | ❌ | RSA public key (for Core Service) |

---

## 8. How Core Service Validates Tokens

The Core Service **never calls the Auth Service** to validate tokens. Instead:

1. Core Service fetches the RSA public key from `GET /api/auth/.well-known/jwks` (once, on startup).
2. For every request, Core Service validates the JWT signature locally using the public key.
3. This is fast, scalable, and doesn't create inter-service dependencies.

---

## 9. Configuration (`appsettings.json`)

```json
{
  "Jwt": {
    "Issuer": "ArenaOps",
    "Audience": "ArenaOps",
    "AccessTokenExpiryMinutes": 30,
    "RefreshTokenExpiryDays": 7,
    "KeyFilePath": "Keys/rsa-private.key"
  },
  "GoogleAuth": {
    "ClientId": "your-google-client-id",
    "ClientSecret": "your-google-client-secret"
  }
}
```

---

## 10. Frontend Integration Checklist

- [ ] Store access token in React state/context (memory)
- [ ] Store refresh token in localStorage
- [ ] Add `Authorization: Bearer <token>` header to all API calls
- [ ] Add Axios/Fetch interceptor to catch `401` and auto-refresh
- [ ] On logout: clear tokens from memory + call `/api/auth/logout`
- [ ] On page load: check if refresh token exists → auto-refresh to get new access token
- [ ] Handle `TOKEN_REVOKED` error → redirect to login
