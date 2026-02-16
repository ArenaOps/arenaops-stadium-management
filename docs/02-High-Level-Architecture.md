# High-Level Architecture

## 1) Architecture Diagram

```
                    ┌──────────────────────────────────────────────┐
                    │              External Services               │
                    │  ┌──────────┐  ┌───────────┐  ┌───────────┐ │
                    │  │ Payment  │  │ Maps /    │  │  Email /  │ │
                    │  │ Gateway  │  │ Geocoding │  │  SMS      │ │
                    │  └────▲─────┘  └─────▲─────┘  └─────▲─────┘ │
                    │  ┌──────────┐                                │
                    │  │ Google   │                                │
                    │  │ OAuth    │                                │
                    │  └────▲─────┘                                │
                    └───────│──────────────│──────────────│────────┘
                            │              │              │
                            │              │              │
    ┌───────────────────────┴──────────────┴──────────────┴───────┐
    │                    FRONTEND (Next.js)                        │
    │              App Router + BFF Proxy Layer                    │
    │                                                              │
    │  ┌─────────────────────┐  ┌──────────────────────────────┐  │
    │  │  Server Components  │  │  Client Components           │  │
    │  │  • Event Discovery  │  │  • Seat Map (SVG + SignalR)  │  │
    │  │  • Stadium Pages    │  │  • Layout Editor (Drag/Drop) │  │
    │  │  • Booking History  │  │  • Booking Timer             │  │
    │  │  • Admin Dashboard  │  │  • Payment Flow              │  │
    │  └─────────────────────┘  └──────────────────────────────┘  │
    │                                                              │
    │  ┌──────────────────────────────────────────────────────┐   │
    │  │  Route Handlers (app/api/)  — BFF Proxy              │   │
    │  │  • /api/auth/*  → proxies to Auth Service            │   │
    │  │  • /api/core/*  → proxies to Core Service            │   │
    │  └──────────────────────────────────────────────────────┘   │
    └─────┬──────────────────────────────────────┬───────────────┘
          │                                      │
          │ HTTP (internal)                      │ HTTP + WebSocket
          │                                      │ (SignalR)
          │                                      │
    ┌─────▼─────────────┐              ┌─────────▼──────────────────┐
    │  AUTH SERVICE      │              │  CORE SERVICE              │
    │  (ArenaOps.Auth)   │              │  (ArenaOps.Core)           │
    │                    │              │                            │
    │  • Register        │   JWT keys   │  • Stadium Management     │
    │  • Login           │──────────────│  • Seating Plans          │
    │  • Refresh Token   │  (shared     │  • Event Layout Cloning   │
    │  • Role Management │   public     │  • Events & Slots         │
    │  • User Profile    │   key)       │  • Booking & Seat Locking │
    │  • Password Reset  │              │  • Payments               │
    │  • Audit Logging   │  async       │  • Location Discovery     │
    │                    │──events──────│  • Admin & Reporting      │
    │  Publishes:        │  (optional)  │  • Waiting Room           │
    │  • UserCreated     │              │  • Background Jobs        │
    │  • UserUpdated     │              │  • SignalR Hub             │
    │  • UserDeleted     │              │                            │
    └────────┬───────────┘              └────────────┬──────────────┘
             │                                       │
    ┌────────▼───────────┐              ┌────────────▼──────────────┐
    │  Auth Database     │              │  Core Database            │
    │  (SQL Server)      │              │  (SQL Server)             │
    │                    │              │                            │
    │  • Users           │              │  • Stadium                │
    │  • Roles           │              │  • SeatingPlan (Template) │
    │  • UserRoles       │              │  • Section / Seat         │
    │  • RefreshTokens   │              │  • EventSeatingPlan       │
    │  • AuditLog        │              │  • Event / EventSlot      │
    │                    │              │  • EventSeat              │
    │  Data Access:      │              │  • TicketType             │
    │  • EF Core         │              │  • Booking / BookingSeat  │
    │                    │              │  • Payment                │
    │                    │              │  • IdempotencyKey         │
    │                    │              │  • Stored Procedures:     │
    │                    │              │    - sp_HoldSeat           │
    │                    │              │    - sp_CleanupExpiredHolds│
    │                    │              │    - sp_ConfirmBooking     │
    └────────────────────┘              └───────────┬───────────────┘
                                                    │
                                           ┌────────▼──────────┐
                                           │  Redis Cache      │
                                           │  • Seat Maps      │
                                           │  • Rate Limits    │
                                           │  • Waiting Room   │
                                           │  • Idempotency    │
                                           └───────────────────┘
```

---

## 2) Component Explanations

### A) Frontend (Next.js — App Router) — User Interaction Layer

#### Responsibilities:

- Render seat maps using **SVG** (Client Components)
- **Real-time seat status updates** via SignalR client
- Allow users to:
    - Browse nearby events (Server Components with SSR)
    - Select date/time
    - Zoom into sections
    - Pick seats (seated sections) or buy slots (standing sections)
- Show seat states (live, updated via SignalR):
    - Available
    - Held
    - Confirmed
- Start seat hold timer
- Initiate payment
- Show booking status
- **Act as BFF Proxy** — Route Handlers forward requests to backend services

#### Why Next.js?

| Advantage | Details |
|-----------|---------|
| **SSR/SSG** | Event discovery and stadium pages are server-rendered for SEO and fast initial loads |
| **Server Components** | Reduce client bundle size — only interactive components (seat map, editor) ship JavaScript |
| **Route Handlers (BFF)** | Browser only talks to `localhost:3000` — eliminates CORS, simplifies auth cookie management |
| **App Router** | File-based routing with layouts, loading states, and error boundaries per route |
| **TypeScript** | Full type safety across the frontend |

#### BFF Proxy Pattern:

```
Browser                        Next.js Server                    Backend Services
  │                                │                                  │
  │  /api/auth/login               │                                  │
  │ ──────────────────────────►    │                                  │
  │                                │  http://auth-service:5001/api/*  │
  │                                │ ────────────────────────────────► │ Auth Service
  │                                │                                  │
  │  /api/core/stadiums            │                                  │
  │ ──────────────────────────►    │                                  │
  │                                │  http://core-service:5002/api/*  │
  │                                │ ────────────────────────────────► │ Core Service
  │                                │                                  │
  │  WebSocket (SignalR)           │                                  │
  │ ◄─────────────────────────────►│ ◄───────────────────────────────►│ SeatStatusHub
```

**Key Benefit**: No CORS issues, secure httpOnly cookie management, single origin for the browser.

---

### B) Auth Service (ArenaOps.AuthService) — Identity & Access

This is a standalone microservice responsible for all identity concerns.

#### Data Access: EF Core

The Auth Service uses **Entity Framework Core** for all database operations (CRUD on Users, Roles, RefreshTokens, AuditLog). No Dapper or stored procedures needed here — operations are straightforward and not concurrency-critical.

#### Responsibilities:

- User registration and login (email/password)
- **Google OAuth 2.0 login** (external provider)
- JWT token generation with **RSA private key**
- Refresh token rotation
- Role management (Admin, Stadium Owner, Organizer, User)
- Password reset
- Audit logging (login attempts, role changes)

#### Google OAuth 2.0 Flow:

```
User                    Frontend (Next.js)              Auth Service           Google
 │                           │                              │                    │
 │  Click "Sign in with     │                              │                    │
 │  Google"                 │                              │                    │
 │ ────────────────────►    │                              │                    │
 │                           │  Redirect to Google         │                    │
 │ ◄─────────────────────── │                              │                    │
 │  ────────────────────────────────────────────────────────────────────────►   │
 │                           │                              │    User consents  │
 │  ◄──────────────────────────────────────────────────────────────────────    │
 │  (Authorization Code)    │                              │                    │
 │ ────────────────────►    │                              │                    │
 │                           │  POST /api/auth/google       │                    │
 │                           │  { code }                    │                    │
 │                           │ ───────────────────────────► │                    │
 │                           │                              │  Exchange code     │
 │                           │                              │  for Google token  │
 │                           │                              │ ──────────────►   │
 │                           │                              │  ◄────────────    │
 │                           │                              │  (email, name,    │
 │                           │                              │   googleId)       │
 │                           │                              │                    │
 │                           │                              │  Find/Create user  │
 │                           │                              │  Issue JWT + RT    │
 │                           │  ◄─────────────────────────  │                    │
 │                           │  { accessToken, refreshToken }                    │
 │  ◄────────────────────── │                              │                    │
 │  Logged in ✅            │                              │                    │
```

**Account Linking Logic:**

| Scenario | What Happens |
|----------|--------------|
| New Google user | Create user with Google email, set role = User, mark email verified |
| Existing user (same email, no Google linked) | Link Google ID to existing account |
| Existing user (Google already linked) | Login normally, issue JWT |
| Google email differs from any existing user | Create new user account |

#### Why a Separate Service?

| Reason | Details |
|--------|---------|
| **Independent scaling** | Auth handles login spikes (event announcements) separately from booking spikes (ticket sales) |
| **Security isolation** | Credentials are in a separate DB; a breach in the Core service doesn't expose passwords |
| **Reusability** | Can serve other future projects |
| **Independent deployment** | Update auth logic (password policies, MFA) without touching booking code |

#### JWT Strategy — RSA Key Pair:

```
Auth Service                         Core Service
    │                                     │
    │  Signs JWT with RSA Private Key     │
    │                                     │
    │  ───── JWT Token ──────────────►    │
    │                                     │  Validates JWT with
    │                                     │  RSA Public Key (local)
    │                                     │  
    │                                     │  Extracts: userId, roles
    │                                     │  No HTTP call needed! ✅
```

The Auth service has the **private key**, the Core service has only the **public key**. This means the Core service can **verify** tokens but can never **issue** them. This is the industry-standard approach (same as how Google, Auth0, and Keycloak work).

---

### C) Core Service (ArenaOps.CoreService) — Business Logic Brain

This is where all critical domain logic lives.

#### Data Access Strategy: EF Core + Dapper with Stored Procedures

The Core Service uses a **hybrid data access approach**:

| Operation Type | Technology | Why |
|----------------|-----------|-----|
| **CRUD operations** (Stadium, Events, Sections, TicketTypes) | **EF Core** | Clean, readable, migrations, change tracking |
| **Seat hold / lock** | **Dapper + Stored Procedure** (`sp_HoldSeat`) | Atomic operation, concurrency-safe, no EF overhead |
| **Expired hold cleanup** | **Dapper + Stored Procedure** (`sp_CleanupExpiredHolds`) | Bulk update in DB layer, logs cleanup actions |
| **Booking confirmation** | **Dapper + Stored Procedure** (`sp_ConfirmBookingSeats`) | Multi-table transactional update in DB |
| **Seat map reads** | **Dapper** | Performance-critical — reading thousands of seats |
| **Nearby search (Haversine)** | **Dapper** | Complex math queries are cleaner via Dapper |
| **Admin reports/analytics** | **Dapper** | Aggregation queries are more natural in SQL |

**Key Principle:** EF Core for writes that need change tracking and migrations. Dapper + Stored Procedures for reads and concurrency-critical operations.

#### Key Modules:

##### 1) Layout & Seat Service

Handles:

- Base seating plan templates (created by Stadium Owner)
- Sections (Seated and Standing types) and Seats
- Landmarks (stage, gates, exits)
- Drag-and-drop section positions
- **Event-level layout cloning and customization**

##### 2) Event Layout Customization (New)

This is the workflow for event-specific layouts:

```
Stadium Owner                              Event Organizer
     │                                          │
     │  Creates base templates:                 │
     │  • "Football Layout"                     │
     │  • "Concert Layout"                      │
     │  • "Cricket Layout"                      │
     │                                          │
     └──── Base Template ─────────────────►    │
                                                │  Step 1: Clone template
                                                │  Step 2: Customize for event:
                                                │    • Remove sections (e.g., remove east stand)
                                                │    • Add stage landmark
                                                │    • Add standing section ("Ground Floor", capacity 500)
                                                │    • Adjust section positions
                                                │  Step 3: Go Live → layout becomes immutable
                                                │  Step 4: Seats are cloned to EventSeats
```

**Section Types:**

| Type | Has Individual Seats? | Booking Model |
|------|----------------------|---------------|
| **Seated** | Yes — seats with row/number/position | User picks a specific seat |
| **Standing** | No — just a capacity count | User buys an available "slot" (e.g., GA-001) |

##### 3) Booking & Seat Locking Service (Most Critical)

Handles:

- Seat lifecycle: **Available → Held → Confirmed**
- **Stored Procedure** `sp_HoldSeat` called via **Dapper**:

    ```sql
    CREATE PROCEDURE sp_HoldSeat
        @EventSeatId UNIQUEIDENTIFIER,
        @UserId UNIQUEIDENTIFIER,
        @HoldDurationMinutes INT = 2
    AS
    BEGIN
        UPDATE EventSeat
        SET Status = 'Held',
            LockedUntil = DATEADD(MINUTE, @HoldDurationMinutes, GETUTCDATE()),
            LockedByUserId = @UserId
        WHERE EventSeatId = @EventSeatId
          AND Status = 'Available';

        SELECT @@ROWCOUNT AS Success;  -- 1 = held, 0 = already taken
    END
    ```

- Ensures **only one user can hold a seat at a time**
- Creates pending booking before payment
- **Broadcasts seat status changes via SignalR** after each hold/release/confirm

##### 4) SignalR Hub — Real-Time Seat Updates (New)

```
User A holds seat A1        ──► SignalR broadcasts to all viewers of that event
                                  ──► All seat maps update A1 to "Held" (yellow)

User B's payment confirmed  ──► SignalR broadcasts
                                  ──► All seat maps update B3 to "Confirmed" (red)

Hold expires (cleanup job)  ──► SignalR broadcasts
                                  ──► Seat reverts to "Available" (green)
```

**Implementation:**
- `SeatStatusHub` in Core Service
- Groups: each event gets a SignalR group (`event-{eventId}`)
- When seat status changes → broadcast to the event group
- Frontend subscribes when user opens a seat map page

##### 5) Payment Orchestrator

- Initiates payment via external gateway
- Processes webhooks
- Verifies signatures
- Confirms booking via **Stored Procedure** `sp_ConfirmBookingSeats`:

    ```sql
    CREATE PROCEDURE sp_ConfirmBookingSeats
        @BookingId UNIQUEIDENTIFIER
    AS
    BEGIN
        BEGIN TRANSACTION;

        UPDATE EventSeat
        SET Status = 'Confirmed', LockedUntil = NULL
        WHERE EventSeatId IN (
            SELECT EventSeatId FROM BookingSeat WHERE BookingId = @BookingId
        );

        UPDATE Booking SET Status = 'Confirmed' WHERE BookingId = @BookingId;

        COMMIT;
    END
    ```

- Uses **idempotency keys** to avoid duplicate processing

##### 6) Location & Discovery Service

- Haversine formula for distance calculations (via **Dapper**)
- Nearby stadium and event search
- Map data for visualization

##### 7) Background Jobs

Runs periodically using **Stored Procedure** `sp_CleanupExpiredHolds` (called via Dapper):

```sql
CREATE PROCEDURE sp_CleanupExpiredHolds
AS
BEGIN
    UPDATE EventSeat
    SET Status = 'Available', LockedUntil = NULL, LockedByUserId = NULL
    OUTPUT DELETED.EventSeatId, 'Held', 'Available', GETUTCDATE()
    INTO SeatLockCleanupLog(EventSeatId, OldStatus, NewStatus, CleanedAt)
    WHERE Status = 'Held' AND LockedUntil < GETUTCDATE();
END
```

Also handles:
- Cancel unpaid bookings
- Reconcile failed payments

---

### D) Redis (In-Memory Cache & Control Layer)

Redis is **not the source of truth** — SQL Server is.

Used for:

- Caching seat maps (reduces DB load on hot events)
- Rate limiting (protect against abuse)
- Waiting room queue (for high-demand events)
- Storing idempotency keys

This keeps heavy traffic away from the database.

---

### E) Databases (SQL Server) — Single Source of Truth

Two separate databases on the same SQL Server instance:

| Database | Service | Data Access | Contains |
|----------|---------|------------|----------|
| `ArenaOps_AuthDB` | Auth Service | **EF Core** | Users, Roles, UserRoles, RefreshTokens, AuditLog |
| `ArenaOps_CoreDB` | Core Service | **EF Core + Dapper + SPs** | Stadium, SeatingPlan, Sections, Seats, Events, EventSeats, Bookings, Payments, Stored Procedures |

#### Stored Procedures in Core DB:

| Stored Procedure | Called By | Purpose |
|-----------------|-----------|---------|
| `sp_HoldSeat` | Booking Service (Dapper) | Atomic seat hold with concurrency safety |
| `sp_CleanupExpiredHolds` | Background Job (Dapper) | Release expired holds + log cleanup |
| `sp_ConfirmBookingSeats` | Payment Service (Dapper) | Transactional booking confirmation |

#### Why SQL Server?

- Strong ACID transactions
- Row-level locking (critical for seat booking)
- Stored procedures for encapsulating critical business logic
- Reliable consistency under concurrency

---

### F) External Services

#### 1) Payment Gateway (Razorpay / Stripe)

- Handles money securely
- Sends webhooks back to Core Service
- Core Service verifies and finalizes booking

#### 2) Maps / Geocoding (Google Maps / Mapbox / OSM)

Used for:

- Converting city → latitude/longitude
- Showing stadium locations on map
- Finding nearby events

#### 3) Email / SMS (Optional)

Used for:

- Booking confirmation emails
- Password reset links
- Event reminders

---

## 3) Inter-Service Communication

### A. Token Validation (Synchronous — Zero Network Cost)

The Auth service signs JWTs with an RSA private key. The Core service validates JWTs using the RSA public key locally. **No HTTP call is needed per request.**

### B. Real-Time Updates (WebSocket — SignalR)

SignalR provides real-time seat status broadcasts from Core Service → Frontend. All users viewing the same event seat map receive instant updates.

### C. User Data Sync

**Simple Approach (Initial):**

```
Core Service calls: GET /api/auth/users/{userId}
(Only when it needs user display name for booking receipts, etc.)
```

**Production Approach (Later):**

```
Auth Service publishes: UserCreated, UserUpdated, UserDeleted
Core Service subscribes and updates its local UserProfile cache
```

---

## 4) Project Structure

```
ARENAOPS/
├── BACKEND/
│   ├── ArenaOps.AuthService/                 # Microservice 1
│   │   ├── ArenaOps.AuthService.API/         # Web API project
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.cs
│   │   │   │   └── UserManagementController.cs
│   │   │   ├── Program.cs
│   │   │   └── appsettings.json
│   │   ├── ArenaOps.AuthService.Core/        # Business logic
│   │   │   ├── Entities/
│   │   │   ├── Interfaces/
│   │   │   └── Services/
│   │   ├── ArenaOps.AuthService.Infrastructure/  # Data access (EF Core)
│   │   │   ├── Data/
│   │   │   ├── Repositories/
│   │   │   └── Migrations/
│   │   └── ArenaOps.AuthService.sln
│   │
│   ├── ArenaOps.CoreService/                 # Microservice 2
│   │   ├── ArenaOps.CoreService.API/         # Web API project
│   │   │   ├── Controllers/
│   │   │   │   ├── StadiumController.cs
│   │   │   │   ├── SeatingPlanController.cs
│   │   │   │   ├── EventController.cs
│   │   │   │   ├── EventLayoutController.cs  # Event-level layout customization
│   │   │   │   ├── BookingController.cs
│   │   │   │   ├── PaymentController.cs
│   │   │   │   ├── DiscoveryController.cs
│   │   │   │   └── AdminController.cs
│   │   │   ├── Hubs/
│   │   │   │   └── SeatStatusHub.cs          # SignalR Hub
│   │   │   ├── Program.cs
│   │   │   └── appsettings.json
│   │   ├── ArenaOps.CoreService.Core/        # Business logic
│   │   │   ├── Entities/
│   │   │   ├── Interfaces/
│   │   │   └── Services/
│   │   ├── ArenaOps.CoreService.Infrastructure/  # Data access
│   │   │   ├── Data/                          # EF Core DbContext
│   │   │   ├── Repositories/                  # EF Core repositories
│   │   │   ├── DapperQueries/                 # Dapper query classes
│   │   │   ├── StoredProcedures/              # SP SQL scripts
│   │   │   └── Migrations/
│   │   └── ArenaOps.CoreService.sln
│   │
│   └── ArenaOps.Shared/                      # Shared library
│       ├── DTOs/
│       ├── Constants/
│       └── Extensions/
│


FRONTEND/
└── arenaops-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx 
│   │   ├── (dashboard)/
│   │   │      ├── stadiums/page.tsx
│   │   │      ├── events/page.tsx
│   │   │      ├── sevents/[id]/page.tsx
│   │   │      ├── events/[id]/layout-editor/page.tsx
│   │   │      ├── bookings/page.tsx
│   │   │      ├── admin/page.tsx
    │   ├── api/
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── components/                # Pure reusable UI components
    │   ├── ui/
    │   ├── seat-map/
    │   └── layout-editor/
    │
    ├── features/                  # Feature-based modular architecture
    │   ├── auth/
    │   │   ├── api.ts
    │   │   ├── hooks.ts
    │   │   ├── slice.ts
    │   │   ├── components/
    │   │   └── types.ts
    │   │
    │   ├── events/
    │   │   ├── api.ts
    │   │   ├── hooks.ts
    │   │   ├── queries.ts
    │   │   ├── components/
    │   │   └── types.ts
    │   │
    │   ├── bookings/
    │   └── stadiums/
    │
    ├── store/                     # Redux Toolkit
    │   ├── index.ts
    │   ├── rootReducer.ts
    │   └── providers.tsx
    │
    ├── services/                  # TanStack Query config + global fetch logic
    │   ├── query-client.ts
    │   ├── axios.ts
    │   └── interceptors.ts
    │
    ├── hooks/                     # Global reusable hooks
    │   ├── useAuth.ts
    │   ├── useDebounce.ts
    │   └── usePagination.ts
    │
    ├── styles/                    # SCSS architecture
    │   ├── components/
    │   ├── _mixins.scss
    │   ├── _variables.scss
    │   ├── base.scss
    │   ├── globals.scss
    │   └── tailwind.css
    │
    ├── types/                    # Types architecture
    │   ├── style.d.ts
    │
    ├── utils/                     # Pure helper functions
    │   ├── formatDate.ts
    │   ├── seatHelpers.ts
    │   └── constants.ts
    │
    ├── lib/                       # Keep existing (server-related helpers)
    │   ├── api.ts
    │   ├── auth.ts
    │   └── signalr.ts
    │
    ├── providers/                 # App-level providers wrapper
    │   ├── redux-provider.tsx
    │   ├── query-provider.tsx
    │   └── theme-provider.tsx
    │
    ├── middleware.ts              # Route protection
    │
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json

├── docs/                                      # Project documentation
│
└── docker-compose.yml                         # Orchestrates all services
```

---

## 5) End-to-End Flow (How Everything Works Together)

### Scenario: Concert event setup + seat booking

**Phase 1: Layout Setup (By Stadium Owner)**

1. Stadium Owner creates stadium with location
2. Stadium Owner creates base templates: "Football Layout", "Concert Layout"
3. Each template has sections (Seated + Standing) and landmarks

**Phase 2: Event Setup (By Organizer)**

4. Organizer creates a new event → selects "Concert Layout" template
5. System **clones** the template into an event-specific layout
6. Organizer customizes:
    - Removes East Stand section
    - Adds "Stage" landmark
    - Adds "Ground Standing" section (capacity: 500)
    - Adjusts section positions
7. Organizer adds time slots and ticket types
8. Organizer goes **Live** → layout becomes immutable → seats cloned to EventSeats

**Phase 3: Booking (By User)**

9. User opens app → Next.js SSR page shows nearby events
10. User selects concert → seat map loaded (Client Component + SignalR connection)
11. User sees **real-time availability** (seats update live via SignalR)
12. User clicks a seated section → picks specific seat
13. Or clicks standing section → gets next available slot
14. Next.js Route Handler forwards hold request to Core Service
15. Core Service calls **`sp_HoldSeat`** via Dapper → atomic lock
16. If success → seat becomes Held → **SignalR broadcasts** to all viewers
17. 2-minute countdown starts on frontend
18. User proceeds to payment → Next.js Route Handler initiates payment
19. Payment gateway sends webhook to Core Service
20. Core Service calls **`sp_ConfirmBookingSeats`** via Dapper
21. **SignalR broadcasts** seat confirmed to all viewers
22. User sees booking confirmation

---

## 6) Why This Architecture is Strong

| Strength | Details |
|----------|---------|
| ✅ Strong consistency | Stored procedures for atomic seat operations |
| ✅ Real-time updates | SignalR broadcasts seat changes instantly |
| ✅ Flexible layouts | Event-level customization from base templates |
| ✅ Mixed sections | Supports both seated and standing areas |
| ✅ Scalable reads | Dapper for fast seat map queries + Redis caching |
| ✅ Clean writes | EF Core for standard CRUD with migrations |
| ✅ Stateless backends | Both services are horizontally scalable |
| ✅ Security isolation | Auth credentials in separate DB |
| ✅ No CORS issues | Next.js BFF proxy — single origin |
| ✅ SEO-friendly | Server-rendered event pages |
| ✅ Independent deployment | Auth and Core deploy separately |
| ✅ Clean separation | Layout vs Event vs Pricing vs Booking |
