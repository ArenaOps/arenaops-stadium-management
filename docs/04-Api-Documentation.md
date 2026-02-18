# API Documentation — By Module

> **Architecture:** Next.js BFF proxy forwards all browser requests to backend services.
> **Data Access:** EF Core (CRUD) | Dapper + Stored Procedures (reads + concurrency). No raw SQL.

---

# 1) AUTH SERVICE (`http://localhost:5001`) — EF Core

## Authentication

| Endpoint | Method | Request Body | Response |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | `{ email, password, fullName }` | `{ userId, message }` — *Role forced to "User"* |
| `/api/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, userId, roles }` |
| `/api/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `/api/auth/logout` | POST | `{ refreshToken }` | `{ message }` — *Blacklists JWT + deletes refresh token* |
| `/api/auth/stadium-manager` | POST | `{ email, fullName, phoneNumber }` | `{ userId, message }` — *Admin Only. Sends temp password.* |
| `/api/auth/forgot-password` | POST | `{ email }` | `{ message }` |
| `/api/auth/reset-password` | POST | `{ token, newPassword }` | `{ message }` |

## Google OAuth

| Endpoint | Method | Request Body | Response |
| --- | --- | --- | --- |
| `/api/auth/google` | POST | `{ code, redirectUri }` | `{ accessToken, refreshToken, userId, roles, isNewUser }` |
| `/api/auth/google/link` | POST | `{ code, redirectUri }` | `{ message }` — Links Google to existing account (requires JWT) |
| `/api/auth/google/unlink` | POST | *(empty)* | `{ message }` — Unlinks Google (only if user has password set, requires JWT) |

**Google OAuth Flow:**
1. Frontend redirects user to Google consent screen
2. Google redirects back with an authorization `code`
3. Frontend sends the `code` to `/api/auth/google`
4. Auth Service exchanges the code with Google for user info (email, name, picture)
5. Auth Service finds or creates a user, then returns JWT tokens

## User Management (Admin)

| Endpoint | Method | Response |
| --- | --- | --- |
| `/api/auth/users` | GET | `[ { userId, email, fullName, roles, isActive } ]` |
| `/api/auth/users/{id}` | GET | `{ userId, email, fullName, roles }` |
| `/api/auth/users/{id}/roles` | PUT | `{ message }` — Body: `{ roles: ["Organizer"] }` |
| `/api/auth/users/{id}/activate` | PUT | `{ message }` — Body: `{ isActive: true }` |

---

# 2) CORE SERVICE (`http://localhost:5002`)

> All endpoints require JWT `Authorization: Bearer <token>`. Core validates with Auth's RSA public key.

## A) Stadium — EF Core

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/stadiums` | POST | Owner | Create stadium with location |
| `GET /api/stadiums` | GET | Any | List all stadiums |
| `GET /api/stadiums/{id}` | GET | Any | Get stadium details |
| `PUT /api/stadiums/{id}` | PUT | Owner | Update stadium |

## B) Base Seating Plans (Templates) — EF Core

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/stadiums/{id}/seating-plans` | POST | Owner | Create base template |
| `GET /api/stadiums/{id}/seating-plans` | GET | Any | List templates for stadium |
| `GET /api/seating-plans/{id}` | GET | Any | Full template with sections + landmarks (**Dapper**) |

### Sections (Template)

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/seating-plans/{id}/sections` | POST | Owner | Add section (type: Seated/Standing) |
| `GET /api/seating-plans/{id}/sections` | GET | Any | List sections |
| `PUT /api/sections/{id}` | PUT | Owner | Update section |
| `DELETE /api/sections/{id}` | DELETE | Owner | Remove section |

### Seats (Template — Seated sections only)

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/sections/{id}/seats` | POST | Owner | Add individual seat |
| `GET /api/sections/{id}/seats` | GET | Any | List seats in section |
| `POST /api/sections/{id}/seats/bulk` | POST | Owner | Generate grid of seats |
| `PUT /api/seats/{id}` | PUT | Owner | Update seat (active/accessible) |

### Landmarks (Template)

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/seating-plans/{id}/landmarks` | POST | Owner | Add landmark (stage, gate, exit) |
| `GET /api/seating-plans/{id}/landmarks` | GET | Any | List landmarks |
| `PUT /api/landmarks/{id}` | PUT | Owner | Update landmark position |
| `DELETE /api/landmarks/{id}` | DELETE | Owner | Remove landmark |

---

## C) Event Management — EF Core

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/events` | POST | Organizer | Create event (name, stadiumId) |
| `GET /api/events` | GET | Any | List events (filter: ?status=Live) |
| `GET /api/events/{id}` | GET | Any | Full event details (**Dapper**) |
| `PUT /api/events/{id}` | PUT | Organizer | Update event (409 if Live) |
| `POST /api/events/{id}/slots` | POST | Organizer | Add time slot |
| `GET /api/events/{id}/slots` | GET | Any | List time slots |

---

## D) Event Layout Customization — EF Core (New)

> **Flow:** Clone Template → Customize (add/remove sections, add landmarks) → Lock Layout → Generate EventSeats → Go Live

### Clone & Manage Layout

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/events/{id}/layout/clone` | POST | Organizer | Clone base template for event. Body: `{ seatingPlanId }` |
| `GET /api/events/{id}/layout` | GET | Any | Get event layout with sections + landmarks (**Dapper**) |
| `POST /api/events/{id}/layout/lock` | POST | Organizer | Lock layout (no more edits allowed) |

### Event Sections (Customizable before lock)

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `GET /api/events/{id}/layout/sections` | GET | Any | List event sections |
| `POST /api/events/{id}/layout/sections` | POST | Organizer | Add new section (Seated/Standing). 409 if locked |
| `PUT /api/events/{id}/layout/sections/{sId}` | PUT | Organizer | Update section. 409 if locked |
| `DELETE /api/events/{id}/layout/sections/{sId}` | DELETE | Organizer | Remove section. 409 if locked |

### Event Landmarks (Customizable before lock)

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/events/{id}/layout/landmarks` | POST | Organizer | Add landmark. 409 if locked |
| `PUT /api/events/{id}/layout/landmarks/{lId}` | PUT | Organizer | Update landmark. 409 if locked |
| `DELETE /api/events/{id}/layout/landmarks/{lId}` | DELETE | Organizer | Remove landmark. 409 if locked |

### Generate EventSeats

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/events/{id}/generate-seats` | POST | Organizer | Generate EventSeats from locked layout. Returns seated + standing counts |

---

## E) Ticketing & Pricing — EF Core

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/events/{id}/ticket-types` | POST | Organizer | Create ticket type (name, price) |
| `GET /api/events/{id}/ticket-types` | GET | Any | List ticket types |
| `POST /api/events/{id}/sections/{sId}/map-ticket` | POST | Organizer | Map ticket type to event section |
| `GET /api/events/{id}/sections/{sId}/ticket-types` | GET | Any | Get ticket types for section |

---

## F) Booking & Seat Lifecycle — Dapper + SP (Most Critical)

| Endpoint | Method | Auth | Description | Data Access |
| --- | --- | --- | --- | --- |
| `GET /api/events/{id}/seats` | GET | Any | Seat map with status. Query: `?sectionId=uuid` | **Dapper** |
| `POST /api/events/{id}/seats/{seatId}/hold` | POST | User | Hold a specific seat (seated sections) | **Dapper + SP** |
| `POST /api/events/{id}/seats/{seatId}/release` | POST | User | Release your hold | **Dapper** |
| `POST /api/events/{id}/standing/{sectionId}/hold` | POST | User | Hold N standing slots. Body: `{ quantity }` | **Dapper + SP** |
| `POST /api/bookings` | POST | User | Create booking from held seats | EF Core |
| `GET /api/bookings/{id}` | GET | User | Get booking details | EF Core |
| `POST /api/bookings/{id}/confirm` | POST | User | Confirm after payment | **Dapper + SP** |
| `POST /api/bookings/{id}/cancel` | POST | User | Cancel booking, release seats | EF Core |
| `GET /api/bookings/my` | GET | User | My bookings | EF Core |

> **SignalR:** After every hold/release/confirm → broadcasts `SeatStatusChanged` to all viewers of that event.

---

## G) Payment — EF Core + Dapper

| Endpoint | Method | Auth | Description | Data Access |
| --- | --- | --- | --- | --- |
| `POST /api/payments/initiate` | POST | User | Start payment (bookingId, idempotencyKey) | EF Core |
| `POST /api/payments/webhook` | POST | Public | Gateway callback → confirm booking | **Dapper + SP** |
| `GET /api/payments/{id}` | GET | User | Payment status | EF Core |
| `POST /api/payments/refund` | POST | Admin | Refund payment | EF Core |

---

## H) Location & Discovery — Dapper

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `GET /api/stadiums/nearby` | GET | Public | Query: `?lat=10&lng=76&radiusKm=30` |
| `GET /api/events/nearby` | GET | Public | Query: `?lat=10&lng=76&radiusKm=50` |
| `GET /api/events/search` | GET | Public | Query: `?query=coldplay&city=Mumbai` |

---

## I) Waiting Room — Redis

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `POST /api/waiting-room/join` | POST | User | Join queue for event |
| `GET /api/waiting-room/status` | GET | User | Check queue position |
| `POST /api/waiting-room/leave` | POST | User | Leave queue |

---

## J) Admin & Reporting — Dapper (reads) + EF Core (writes)

| Endpoint | Method | Description |
| --- | --- | --- |
| `GET /api/admin/stadiums` | GET | List stadiums (pending approval) |
| `POST /api/admin/stadiums/{id}/approve` | POST | Approve stadium |
| `GET /api/admin/events` | GET | All events with stats |
| `GET /api/admin/events/{id}/revenue` | GET | Revenue breakdown |
| `GET /api/admin/bookings` | GET | Filter bookings |
| `GET /api/admin/dashboard` | GET | System-wide stats |

---

# 3) SignalR Hub — Real-Time Seat Updates

**Hub URL:** `/hubs/seat-status`

| Direction | Method | Payload | When |
|-----------|--------|---------|------|
| Client → Server | `JoinEventRoom` | `eventId` | User opens seat map |
| Client → Server | `LeaveEventRoom` | `eventId` | User leaves seat map |
| Server → Client | `SeatStatusChanged` | `{ eventSeatId, seatLabel, oldStatus, newStatus, sectionType }` | Single seat change |
| Server → Client | `BulkSeatStatusChanged` | `[{ eventSeatId, seatLabel, oldStatus, newStatus }]` | Bulk change (cleanup job) |

---

# 4) Background Jobs

| Job | Trigger | Data Access |
| --- | --- | --- |
| Seat Hold Cleanup (`sp_CleanupExpiredHolds`) | Every 1–2 min | Dapper + SP |
| Pending Booking Cleanup | Every 5 min | EF Core |
| Payment Reconciliation | Hourly | EF Core |
| User Profile Sync | Every 30 min | EF Core |

---

# 5) BFF Route Handler Mapping

| Browser Calls | Forwards To |
|---|---|
| `/api/auth/*` → `app/api/auth/[...slug]/route.ts` | `http://auth-service:5001/api/auth/*` |
| `/api/core/*` → `app/api/core/[...slug]/route.ts` | `http://core-service:5002/api/*` |

**Exceptions:** Payment webhooks and SignalR connect directly to Core Service.

---

# 6) Response Patterns

```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "error": { "code": "SEAT_ALREADY_HELD", "message": "...", "details": { ... } } }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "pageSize": 20, "totalCount": 150 } }
```
