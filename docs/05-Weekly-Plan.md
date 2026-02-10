# Weekly Plan

## Team Structure

### Week 1 — 2 Backend + 2 Frontend

| Person | Role | Primary Focus |
| --- | --- | --- |
| **Backend 1** | Auth Lead | Auth Service setup, JWT RSA, Register/Login |
| **Backend 2** | Core Lead | Core Service setup, Docker, shared library |
| **Frontend 1** | App Lead | Next.js setup, BFF proxy, Login/Register |
| **Frontend 2** | UI Lead | Landing page, navigation, auth state, dashboard skeleton |

### Week 2 onwards — 3 Backend + 2 Frontend

| Person | Role | Primary Focus |
| --- | --- | --- |
| **Backend 1** | Architecture + Booking | EventSeat, locking, concurrency, stored procedures |
| **Backend 2** | Layout + Event | Stadium, SeatingPlan, Sections, Events, layout cloning |
| **Backend 3** | Payments + Infra | Payment, webhooks, Redis, location, background jobs |
| **Frontend 1** | App + Seat Picker | Seat map, booking flow, SignalR integration |
| **Frontend 2** | Layout Editor + Admin | Layout editor, event management, admin dashboard |

---

# WEEK 1 — FOUNDATION (2 BE + 2 FE)

## Goals

- Set up both microservice projects
- Implement authentication as a standalone service
- Set up Next.js with BFF proxy
- Docker Compose for local dev

## Deliverables

- Git repo with mono-repo structure
- Auth Service with JWT (RSA key pair)
- Core Service skeleton with JWT validation
- Next.js app with Route Handler proxies
- Docker Compose running all services

### Backend 1

- Set up `ArenaOps.AuthService` with Clean Architecture (API, Core, Infrastructure)
- Create Auth DB schema (Users, Roles, UserRoles, RefreshTokens, AuthAuditLog)
- Implement JWT with RSA key pair (sign with private key, export public key)
- Implement endpoints: Register, Login, Refresh, Logout
- Add role-based claims to JWT (userId, email, roles[])
- Seed default roles (Admin, StadiumOwner, Organizer, User)

### Backend 2

- Set up `ArenaOps.CoreService` with Clean Architecture
- Create Core DB schema (Stadium, SeatingPlan, Section, Seat, Landmark)
- Configure JWT validation using Auth's RSA public key
- Set up Docker Compose (SQL Server, Redis, Auth, Core containers)
- Configure Serilog for both services
- Create `ArenaOps.Shared` library (common DTOs, constants, response wrapper)
- Set up health check endpoints for both services
- Configure Dapper alongside EF Core in Core Service

### Frontend 1

- Initialize Next.js project (App Router + TypeScript)
- Build Login and Register pages
- Implement BFF Route Handlers:
    - `app/api/auth/[...slug]/route.ts` → Auth Service
    - `app/api/core/[...slug]/route.ts` → Core Service
- Set up JWT storage via httpOnly cookies (Next.js middleware)
- Set up SignalR client utility (`lib/signalr.ts`)

### Frontend 2

- Build landing page with modern design
- Build navigation (navbar with auth state)
- Implement role-based route guards
- Build dashboard skeleton with sidebar for different roles
- Set up global styles, design tokens, typography
- Loading states and error boundary templates

### Week 1 Milestone

✅ Both services run independently via Docker  
✅ User can register and login  
✅ JWT issued by Auth is validated by Core  
✅ Next.js BFF proxy forwards requests  
✅ Landing page and auth pages functional

---

# WEEK 2 — LAYOUT & TEMPLATE SYSTEM (3 BE + 2 FE)

> **Backend 3 joins the team this week**

## Goals

- Stadium owners can create and design base seat layout templates
- Support for Seated and Standing section types

### Backend 1

- Review DB constraints and add indexes
- Implement authorization policies (`[Authorize(Roles = "StadiumOwner")]`)
- Set up Dapper query infrastructure in Core Service
- Create stored procedure SQL scripts (sp_HoldSeat, sp_CleanupExpiredHolds, sp_ConfirmBookingSeats) — ready for Week 4

### Backend 2 (Primary)

- Implement Stadium APIs (POST/GET/PUT)
- Implement SeatingPlan APIs (POST/GET)
- Implement Section APIs with Type field (Seated/Standing)
- Implement Seat APIs (POST/GET/bulk generate — Seated sections only)
- Implement Landmark APIs (POST/GET/PUT/DELETE)

### Backend 3

- Set up Redis connection in Core Service
- Implement Redis caching for seating plan data and stadium list
- Implement rate limiting middleware
- Add cache invalidation on layout updates
- Set up SignalR Hub (`SeatStatusHub`) in Core Service

### Frontend 1

- Build SVG seat map renderer component (Client Component)
- Render sections with different colors
- Render individual seats within sections
- Handle standing sections (show capacity block instead of individual seats)

### Frontend 2 (Primary)

- Build **Layout Editor UI** (Client Component — drag-and-drop):
    - Stadium creation form
    - Add sections (Seated + Standing types)
    - Drag sections to position on canvas
    - Generate seats in grid for Seated sections
    - Set capacity for Standing sections
    - Add landmarks (Stage, Gate, Exit)
    - Save layout to backend

### Week 2 Milestone

✅ Stadium owner can create a stadium and base templates  
✅ Sections support both Seated and Standing types  
✅ Drag-and-drop layout editor works  
✅ Redis caching active  
✅ SignalR Hub ready (no broadcasts yet)

---

# WEEK 3 — EVENTS + LAYOUT CLONING + CUSTOMIZATION

## Goals

- Event creation with layout cloning
- Organizers can customize cloned layouts
- Ticket types and pricing

### Backend 1 (Critical)

- Implement **Layout Cloning Logic:**
    - `POST /api/events/{id}/layout/clone`
    - Clone SeatingPlan → EventSeatingPlan
    - Clone Sections → EventSections
    - Clone Landmarks → EventLandmarks
    - Wrap in transaction
- Implement **EventSeat Generation:**
    - `POST /api/events/{id}/generate-seats`
    - For Seated sections: clone from template Seats
    - For Standing sections: generate N slots (GA-001 to GA-N)
    - Assign prices from mapped TicketTypes

### Backend 2

- Implement Event APIs (POST/GET/PUT)
- Implement EventSlot APIs
- Implement Event Layout Customization APIs:
    - Add/update/delete EventSections (before lock)
    - Add/update/delete EventLandmarks (before lock)
    - Lock layout endpoint
- Event status workflow: Draft → Live → Completed → Cancelled
- Validation: cannot edit locked layouts, must lock before generating seats

### Backend 3

- Implement TicketType APIs (POST/GET)
- Implement Section-TicketType mapping
- Price assignment logic during seat generation
- Cache event layout data in Redis

### Frontend 1

- Build event seat map preview (read-only view of event layout with sections + landmarks)
- Display section types (seated vs standing) with different visual styles
- Show ticket prices per section

### Frontend 2

- Build **Event Management Page:**
    - Create event form
    - Select stadium and base template
    - Clone layout button
- Build **Event Layout Editor** (customize cloned layout):
    - Add/remove sections, add stage landmarks
    - Create standing areas with capacity
    - Lock layout + generate seats buttons
    - Reuse drag-and-drop from layout editor

### Week 3 Milestone

✅ Organizer creates event and clones a base template  
✅ Organizer customizes layout (add stage, standing areas)  
✅ Layout lock prevents further edits  
✅ EventSeats generated from locked layout  
✅ Ticket types mapped to sections

---

# WEEK 4 — BOOKING + SEAT LOCKING (HARDEST PART)

## Goals

- Concurrency-safe seat hold and booking
- Real-time seat status via SignalR
- **Correctness is paramount this week**

### Backend 1 (Lead — Core Work)

- Deploy stored procedures to DB:
    - `sp_HoldSeat`
    - `sp_CleanupExpiredHolds`
    - `sp_ConfirmBookingSeats`
- Implement seat hold via Dapper calling `sp_HoldSeat`
- Implement standing section hold (hold N available slots)
- Implement seat release
- Implement booking creation (validate all seats held by requesting user)
- **Integrate SignalR broadcasts** after each hold/release/confirm

### Backend 2

- Implement booking status workflow:
    - Pending → Confirmed (after payment)
    - Pending → Cancelled (user or timeout)
    - Pending → Failed (payment failed)
- Booking confirm/cancel endpoints
- Admin booking overview API
- Seat map read query via Dapper (full event seat map with status)

### Backend 3

- Implement background job (`IHostedService`):
    - Calls `sp_CleanupExpiredHolds` via Dapper every 1-2 min
    - Broadcasts released seats via SignalR
- Implement pending booking cleanup (cancel unpaid bookings > 10 min)
- Log cleanup actions to SeatLockCleanupLog

### Frontend 1 (Primary)

- Build **Seat Picker UI** (Client Component + SignalR):
    - Load event seat map via BFF
    - SVG rendering with color states:
        - 🟢 Green = Available
        - 🟡 Yellow = Held (by you)
        - 🔴 Red = Held/Confirmed (by others)
        - ⚫ Grey = Inactive
        - ♿ Blue outline = Accessible
    - Click seat to hold (calls SP via BFF)
    - Standing section: quantity selector + "Hold Slots" button
    - **SignalR integration:** real-time color updates as other users hold/book
    - 2-minute countdown timer
    - Multi-seat selection
    - "Proceed to Payment" button

### Frontend 2

- Build booking summary page
- Build booking list page (My Bookings)
- Handle timer expiration (auto-release)
- Error states and retry logic

### Week 4 Milestone

✅ Seat hold works via stored procedures (atomic)  
✅ No two users can hold the same seat  
✅ **Real-time seat updates via SignalR**  
✅ Standing section booking works  
✅ Booking created from held seats  
✅ Expired holds auto-released by background job

---

# WEEK 5 — PAYMENTS + LOCATION + WAITING ROOM

## Goals

- Full payment integration
- Location-based discovery
- Waiting room for high-demand events

### Backend 1

- Connect booking confirmation to payment:
    1. Webhook received → verify signature
    2. Call `sp_ConfirmBookingSeats` via Dapper
    3. Broadcast confirmed seats via SignalR
- Ensure idempotency key prevents duplicate processing

### Backend 2

- Implement location APIs via Dapper:
    - `GET /api/stadiums/nearby` (Haversine query)
    - `GET /api/events/nearby`
    - `GET /api/events/search`

### Backend 3 (Primary)

- Implement payment initiation (create Payment record, call gateway API)
- Implement webhook handler (verify signature, process result)
- Implement refund endpoint
- Implement waiting room in Redis:
    - Join (ZADD), Status (ZRANK), Leave (ZREM)

### Frontend 1

- Build payment flow:
    - "Pay Now" → redirect to gateway
    - Handle success/failure callbacks
    - Booking confirmation with digital ticket view

### Frontend 2

- Build **Nearby Events Page** (Server Component — SSR for SEO):
    - Browser geolocation or city input
    - Events sorted by distance
    - Map visualization
- Build waiting room UI (queue position, polling, auto-redirect)

### Week 5 Milestone

✅ Full booking → payment → confirmation flow  
✅ Webhook correctly confirms booking + broadcasts via SignalR  
✅ Nearby search works  
✅ Waiting room functional

---

# WEEK 6 — INTEGRATION, TESTING, POLISH

## Goals

- End-to-end testing, performance tuning, UI polish

### Backend (All 3)

- **Integration Testing:** Full flow (Register → Login → Browse → Hold → Book → Pay → Confirm)
- **Concurrency Testing:** 100 users trying same seat — verify only 1 succeeds
- **Unit Tests:** Stored procedures, booking workflow, Haversine, webhook verification
- **Performance:** Redis caching for hot events, SQL index optimization

### Frontend (Both)

- **UI Polish:** Consistent colors, error messages, loading states, responsive design
- **UX:** Smooth seat selection animations, countdown timer, digital ticket view
- **Performance:** Lighthouse audit (target > 90), optimize SVG for large stadiums
- **Role Dashboards:** Owner, Organizer, User, Admin views

### DevOps

- Finalize Docker Compose
- Environment-specific configs
- Swagger/OpenAPI docs for both services
- README with setup instructions

### Week 6 Milestone

✅ Complete end-to-end flow works  
✅ Concurrency tests pass (no double bookings)  
✅ UI polished and responsive  
✅ Real-time SignalR updates working  
✅ System deployment-ready

---

# WEEKLY MILESTONE SUMMARY

| Week | Team | What Must Be DONE |
| --- | --- | --- |
| Week 1 | 2 BE + 2 FE | Auth Service + Core skeleton + Next.js BFF + Docker |
| Week 2 | 3 BE + 2 FE | Base layout templates (Seated + Standing sections) |
| Week 3 | 3 BE + 2 FE | Events + layout cloning + customization + ticketing |
| Week 4 | 3 BE + 2 FE | Booking + seat locking (Dapper + SP) + SignalR |
| Week 5 | 3 BE + 2 FE | Payments + location + waiting room |
| Week 6 | 3 BE + 2 FE | Testing + performance + UI polish |

---

# CRITICAL RISKS

| Risk | Mitigation |
| --- | --- |
| Seat locking bugs | Stored procedures via Dapper (no raw SQL, no EF for this) |
| Payment webhook failure | Retry + idempotency table |
| Auth Service downtime | Core validates JWT locally (RSA public key) |
| Slow seat map loading | Dapper reads + Redis cache + optimized SVG |
| CORS issues | Eliminated — Next.js BFF |
| Layout cloning complexity | Transaction-wrapped clone with validation |
| SignalR connection drops | Auto-reconnect on client, fallback to polling |
| Standing section oversell | Same SP-based atomic hold as seated sections |

---

# SUCCESS CRITERIA

- ✅ Stadium owner creates reusable base layout templates
- ✅ Organizer clones and customizes layout per event
- ✅ Both seated and standing sections work
- ✅ Seats cloned per event with correct pricing
- ✅ Seat hold via stored procedures (concurrency-safe)
- ✅ **Real-time seat updates via SignalR**
- ✅ No two users can book the same seat
- ✅ Full payment flow with webhook confirmation
- ✅ Nearby event search works
- ✅ Auth and Core services run independently
