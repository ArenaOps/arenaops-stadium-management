# Database Schema

## 1) High-Level ER / Table Relationships (Conceptual)

### Auth Database (`ArenaOps_AuthDB`)

```
USERS ────< USER_ROLES >──── ROLES

USERS ────< REFRESH_TOKENS

USERS ────< AUTH_AUDIT_LOG

USERS ────< EXTERNAL_LOGINS
```

### Core Database (`ArenaOps_CoreDB`)

```
STADIUM ─────< SEATING_PLAN (Base Templates)

SEATING_PLAN ─────< SECTION

SECTION ─────< SEAT   (Template seats)

SEATING_PLAN ─────< LANDMARK

EVENT ──────< EVENT_SEATING_PLAN (Cloned + Customized from Template)

EVENT_SEATING_PLAN ─────< EVENT_SECTION

EVENT_SECTION ─────< EVENT_SEAT   (Cloned from SEAT, or generated for Standing)

EVENT ──────< EVENT_SLOT

EVENT ─────< TICKET_TYPE

EVENT_SECTION ─────< SECTION_TICKET_TYPE >──── TICKET_TYPE

BOOKING ─────< BOOKING_SEAT >──── EVENT_SEAT

BOOKING ─────< PAYMENT
```

**How to read this:**

- One **Stadium** has many base **Seating Plans** (templates)
- One **Seating Plan** has many **Sections** and **Landmarks**
- One **Section** has many **Seats (Template)**
- When an **Event** is created, the organizer **clones** a base template into an **EventSeatingPlan**
- The organizer can **customize** the EventSeatingPlan (add/remove sections, add standing areas)
- **EventSections** are cloned from template Sections (and can be modified)
- **EventSeats** are cloned from template Seats (for Seated sections) or generated (for Standing sections)
- One **Booking** can include multiple **EventSeats**
- One **Booking** has one **Payment**

> **Note:** `UserId` references in the Core database are **GUIDs that reference users in the Auth database**. They are NOT foreign keys to a local table — the Auth service owns user identity.

---

# 2) Auth Database Tables (`ArenaOps_AuthDB`)

**Data Access: Entity Framework Core**

## A) Identity & Access

### Users

| Column | Type | Key |
| --- | --- | --- |
| UserId | UNIQUEIDENTIFIER | **PK** |
| Email | NVARCHAR(255) | UNIQUE |
| PasswordHash | NVARCHAR(500) | *(NULL if Google-only user)* |
| FullName | NVARCHAR(200) | |
| PhoneNumber | NVARCHAR(20) | |
| ProfilePictureUrl | NVARCHAR(500) | *(From Google profile)* |
| AuthProvider | NVARCHAR(20) | *(Local, Google, Both)* |
| IsActive | BIT | |
| IsEmailVerified | BIT | *(Auto-verified for Google users)* |
| CreatedAt | DATETIME2 | |
| UpdatedAt | DATETIME2 | |

---

### Roles

| Column | Type | Key |
| --- | --- | --- |
| RoleId | INT | **PK** |
| Name | NVARCHAR(50) | UNIQUE |

**Seed Data:** Admin, StadiumOwner, Organizer, User

---

### UserRoles

| Column | Type | Key |
| --- | --- | --- |
| UserId | UNIQUEIDENTIFIER | **PK, FK → Users(UserId)** |
| RoleId | INT | **PK, FK → Roles(RoleId)** |

---

### RefreshTokens

| Column | Type | Key |
| --- | --- | --- |
| TokenId | UNIQUEIDENTIFIER | **PK** |
| UserId | UNIQUEIDENTIFIER | **FK → Users(UserId)** |
| Token | NVARCHAR(500) | UNIQUE |
| ExpiresAt | DATETIME2 | |
| CreatedAt | DATETIME2 | |
| RevokedAt | DATETIME2 | |
| ReplacedByToken | NVARCHAR(500) | |

**Purpose:** Supports secure token rotation. When a refresh token is used, it is revoked and replaced by a new one (linked via `ReplacedByToken`).

---

### AuthAuditLog

| Column | Type | Key |
| --- | --- | --- |
| LogId | UNIQUEIDENTIFIER | **PK** |
| UserId | UNIQUEIDENTIFIER | **FK → Users(UserId)** |
| Action | NVARCHAR(50) | *(Login, GoogleLogin, FailedLogin, RoleChanged, PasswordReset)* |
| IpAddress | NVARCHAR(45) | |
| UserAgent | NVARCHAR(500) | |
| CreatedAt | DATETIME2 | |

---

### ExternalLogin (Google OAuth)

| Column | Type | Key |
| --- | --- | --- |
| ExternalLoginId | UNIQUEIDENTIFIER | **PK** |
| UserId | UNIQUEIDENTIFIER | **FK → Users(UserId)** |
| Provider | NVARCHAR(50) | *(Google)* |
| ProviderKey | NVARCHAR(200) | *(Google User ID)* |
| ProviderDisplayName | NVARCHAR(200) | *(Google display name)* |
| CreatedAt | DATETIME2 | |

**Purpose:** Stores external login provider details. Supports linking multiple providers to one user account. One user can have both email/password AND Google login.

**Composite Unique Index:** `(Provider, ProviderKey)` — ensures one Google account maps to one ArenaOps user.

---

# 3) Core Database Tables (`ArenaOps_CoreDB`)

**Data Access: EF Core (CRUD) + Dapper with Stored Procedures (reads + concurrency)**

---

## B) Stadium & Location

### Stadium

| Column | Type | Key |
| --- | --- | --- |
| StadiumId | UNIQUEIDENTIFIER | **PK** |
| OwnerId | UNIQUEIDENTIFIER | **Ref → Auth.Users(UserId)** |
| Name | NVARCHAR(200) | |
| Address | NVARCHAR(300) | |
| City | NVARCHAR(100) | |
| State | NVARCHAR(100) | |
| Country | NVARCHAR(100) | |
| Pincode | NVARCHAR(10) | |
| Latitude | DECIMAL(9,6) | |
| Longitude | DECIMAL(9,6) | |
| IsApproved | BIT | |
| CreatedAt | DATETIME2 | |
| IsActive | BIT | |

> `OwnerId` is a GUID referencing the Auth service's Users table. It is NOT a local FK.

---

## C) Base Seating Plan — Template Layer (Created by Stadium Owner)

### SeatingPlan (Base Template)

| Column | Type | Key |
| --- | --- | --- |
| SeatingPlanId | UNIQUEIDENTIFIER | **PK** |
| StadiumId | UNIQUEIDENTIFIER | **FK → Stadium(StadiumId)** |
| Name | NVARCHAR(100) | *(e.g., "Football Layout", "Concert - Stage East")* |
| Description | NVARCHAR(500) | |
| CreatedAt | DATETIME2 | |
| IsActive | BIT | |

A stadium can have **multiple base templates** for different event types.

---

### Section (Template)

| Column | Type | Key |
| --- | --- | --- |
| SectionId | UNIQUEIDENTIFIER | **PK** |
| SeatingPlanId | UNIQUEIDENTIFIER | **FK → SeatingPlan(SeatingPlanId)** |
| Name | NVARCHAR(100) | |
| Type | NVARCHAR(20) | **'Seated' or 'Standing'** |
| Capacity | INT | *(Used for Standing sections — max number of slots)* |
| SeatType | NVARCHAR(50) | *(VIP, Premium, Standard, etc.)* |
| Color | NVARCHAR(20) | |
| PosX | FLOAT | |
| PosY | FLOAT | |

---

### Seat (Template — only for Seated sections)

| Column | Type | Key |
| --- | --- | --- |
| SeatId | UNIQUEIDENTIFIER | **PK** |
| SectionId | UNIQUEIDENTIFIER | **FK → Section(SectionId)** |
| RowLabel | NVARCHAR(5) | |
| SeatNumber | INT | |
| SeatLabel | NVARCHAR(10) | |
| PosX | FLOAT | |
| PosY | FLOAT | |
| IsActive | BIT | |
| IsAccessible | BIT | |

---

### Landmark (Template)

| Column | Type | Key |
| --- | --- | --- |
| FeatureId | UNIQUEIDENTIFIER | **PK** |
| SeatingPlanId | UNIQUEIDENTIFIER | **FK → SeatingPlan(SeatingPlanId)** |
| Type | NVARCHAR(50) | *(STAGE, GATE, EXIT, RESTROOM, etc.)* |
| Label | NVARCHAR(100) | |
| PosX | FLOAT | |
| PosY | FLOAT | |
| Width | FLOAT | |
| Height | FLOAT | |

---

## D) Event-Level Layout — Cloned & Customized per Event

When an organizer creates an event, they **clone** a base template into event-specific tables that they can customize before going live.

### EventSeatingPlan (Event-Specific Layout)

| Column | Type | Key |
| --- | --- | --- |
| EventSeatingPlanId | UNIQUEIDENTIFIER | **PK** |
| EventId | UNIQUEIDENTIFIER | **FK → Event(EventId)** |
| SourceSeatingPlanId | UNIQUEIDENTIFIER | **FK → SeatingPlan(SeatingPlanId)** |
| Name | NVARCHAR(100) | |
| IsLocked | BIT | *(TRUE once event goes Live — no more edits)* |
| CreatedAt | DATETIME2 | |

---

### EventSection (Event-Specific — Cloned from Section)

| Column | Type | Key |
| --- | --- | --- |
| EventSectionId | UNIQUEIDENTIFIER | **PK** |
| EventSeatingPlanId | UNIQUEIDENTIFIER | **FK → EventSeatingPlan(EventSeatingPlanId)** |
| SourceSectionId | UNIQUEIDENTIFIER | **FK → Section(SectionId)** *(NULL if newly added)* |
| Name | NVARCHAR(100) | |
| Type | NVARCHAR(20) | **'Seated' or 'Standing'** |
| Capacity | INT | *(For Standing sections)* |
| SeatType | NVARCHAR(50) | |
| Color | NVARCHAR(20) | |
| PosX | FLOAT | |
| PosY | FLOAT | |

> **Note:** Organizers can modify cloned sections (change position, rename) or **add entirely new sections** (SourceSectionId = NULL). They can also **delete** cloned sections they don't need.

---

### EventLandmark (Event-Specific — Cloned from Landmark)

| Column | Type | Key |
| --- | --- | --- |
| EventLandmarkId | UNIQUEIDENTIFIER | **PK** |
| EventSeatingPlanId | UNIQUEIDENTIFIER | **FK → EventSeatingPlan(EventSeatingPlanId)** |
| SourceFeatureId | UNIQUEIDENTIFIER | **FK → Landmark(FeatureId)** *(NULL if newly added)* |
| Type | NVARCHAR(50) | |
| Label | NVARCHAR(100) | |
| PosX | FLOAT | |
| PosY | FLOAT | |
| Width | FLOAT | |
| Height | FLOAT | |

---

## E) Event (Time Layer)

### Event

| Column | Type | Key |
| --- | --- | --- |
| EventId | UNIQUEIDENTIFIER | **PK** |
| StadiumId | UNIQUEIDENTIFIER | **FK → Stadium(StadiumId)** |
| OrganizerId | UNIQUEIDENTIFIER | **Ref → Auth.Users(UserId)** |
| Name | NVARCHAR(200) | |
| Description | NVARCHAR(1000) | |
| ImageUrl | NVARCHAR(500) | |
| Status | NVARCHAR(20) | *(Draft / Live / Completed / Cancelled)* |
| CreatedAt | DATETIME2 | |

---

### EventSlot

| Column | Type | Key |
| --- | --- | --- |
| EventSlotId | UNIQUEIDENTIFIER | **PK** |
| EventId | UNIQUEIDENTIFIER | **FK → Event(EventId)** |
| StartTime | DATETIME2 | |
| EndTime | DATETIME2 | |

---

## F) Event Seat Inventory (Most Critical Table)

### EventSeat (Cloned per Event — Generated from EventSection)

| Column | Type | Key |
| --- | --- | --- |
| EventSeatId | UNIQUEIDENTIFIER | **PK** |
| EventId | UNIQUEIDENTIFIER | **FK → Event(EventId)** |
| EventSectionId | UNIQUEIDENTIFIER | **FK → EventSection(EventSectionId)** |
| SourceSeatId | UNIQUEIDENTIFIER | **FK → Seat(SeatId)** *(NULL for standing slots)* |
| SeatLabel | NVARCHAR(10) | *(e.g., "A1" for seated, "GA-001" for standing)* |
| RowLabel | NVARCHAR(5) | *(NULL for standing)* |
| SeatNumber | INT | *(NULL for standing)* |
| SectionType | NVARCHAR(20) | **'Seated' or 'Standing'** |
| Status | NVARCHAR(20) | *(Available / Held / Confirmed)* |
| Price | DECIMAL(10,2) | |
| LockedUntil | DATETIME2 | |
| LockedByUserId | UNIQUEIDENTIFIER | **Ref → Auth.Users(UserId)** |
| PosX | FLOAT | *(NULL for standing)* |
| PosY | FLOAT | *(NULL for standing)* |

**For Seated sections:** One EventSeat per physical seat, cloned from template Seat.
**For Standing sections:** N EventSeats generated based on section Capacity (e.g., 500 slots labeled GA-001 to GA-500). No position data.

**Critical Indexes:**

```sql
CREATE INDEX IX_EventSeat_EventId_Status ON EventSeat(EventId, Status);
CREATE INDEX IX_EventSeat_EventSectionId ON EventSeat(EventSectionId);
CREATE INDEX IX_EventSeat_LockedUntil ON EventSeat(LockedUntil) WHERE Status = 'Held';
```

---

## G) Ticketing & Pricing

### TicketType

| Column | Type | Key |
| --- | --- | --- |
| TicketTypeId | UNIQUEIDENTIFIER | **PK** |
| EventId | UNIQUEIDENTIFIER | **FK → Event(EventId)** |
| Name | NVARCHAR(100) | *(VIP, Premium, Standard, General Admission, etc.)* |
| SalePLU | NVARCHAR(50) | |
| Price | DECIMAL(10,2) | |

---

### SectionTicketType (Mapping Table — maps EventSections to TicketTypes)

| Column | Type | Key |
| --- | --- | --- |
| EventSectionId | UNIQUEIDENTIFIER | **PK, FK → EventSection(EventSectionId)** |
| TicketTypeId | UNIQUEIDENTIFIER | **PK, FK → TicketType(TicketTypeId)** |

---

## H) Booking & Orders

### Booking

| Column | Type | Key |
| --- | --- | --- |
| BookingId | UNIQUEIDENTIFIER | **PK** |
| UserId | UNIQUEIDENTIFIER | **Ref → Auth.Users(UserId)** |
| EventId | UNIQUEIDENTIFIER | **FK → Event(EventId)** |
| Status | NVARCHAR(20) | *(Pending / Confirmed / Cancelled / Failed)* |
| TotalAmount | DECIMAL(10,2) | |
| CreatedAt | DATETIME2 | |

---

### BookingSeat

| Column | Type | Key |
| --- | --- | --- |
| BookingId | UNIQUEIDENTIFIER | **PK, FK → Booking(BookingId)** |
| EventSeatId | UNIQUEIDENTIFIER | **PK, FK → EventSeat(EventSeatId)** |

---

## I) Payment

### Payment

| Column | Type | Key |
| --- | --- | --- |
| PaymentId | UNIQUEIDENTIFIER | **PK** |
| BookingId | UNIQUEIDENTIFIER | **FK → Booking(BookingId)** |
| Provider | NVARCHAR(50) | *(Razorpay / Stripe / Mock)* |
| ProviderPaymentId | NVARCHAR(100) | |
| Amount | DECIMAL(10,2) | |
| Status | NVARCHAR(20) | *(Initiated / Success / Failed / Refunded)* |
| IdempotencyKey | NVARCHAR(100) | UNIQUE |
| CreatedAt | DATETIME2 | |

---

### IdempotencyKey

| Column | Type | Key |
| --- | --- | --- |
| Key | NVARCHAR(100) | **PK** |
| Response | NVARCHAR(MAX) | |
| CreatedAt | DATETIME2 | |

---

## J) Background Job Logging

### SeatLockCleanupLog

| Column | Type | Key |
| --- | --- | --- |
| LogId | UNIQUEIDENTIFIER | **PK** |
| EventSeatId | UNIQUEIDENTIFIER | **FK → EventSeat(EventSeatId)** |
| OldStatus | NVARCHAR(20) | |
| NewStatus | NVARCHAR(20) | |
| CleanedAt | DATETIME2 | |

---

## K) User Profile Cache (Optional)

### UserProfileCache

| Column | Type | Key |
| --- | --- | --- |
| UserId | UNIQUEIDENTIFIER | **PK** |
| Email | NVARCHAR(255) | |
| FullName | NVARCHAR(200) | |
| LastSyncedAt | DATETIME2 | |

---

# 4) Stored Procedures (Called via Dapper)

### sp_HoldSeat — Atomic seat hold

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

### sp_CleanupExpiredHolds — Background job

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

### sp_ConfirmBookingSeats — After payment success

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

---

# 5) Cross-Service Data Reference

Since the Auth and Core services have **separate databases**, user references work as follows:

| Core Table | Column | References |
|------------|--------|------------|
| Stadium | OwnerId | Auth.Users.UserId |
| Event | OrganizerId | Auth.Users.UserId |
| EventSeat | LockedByUserId | Auth.Users.UserId |
| Booking | UserId | Auth.Users.UserId |

These are **logical references**, not database foreign keys. Data integrity is maintained through:

1. JWT validation (only valid users can create records)
2. UserProfileCache (synced from Auth for display purposes)
3. Eventual consistency for user deletion events

---

# 6) Event-Level Layout Cloning Flow

```
Base Template (Stadium Owner)              Event-Specific (Organizer)
──────────────────────────────              ──────────────────────────

SeatingPlan                     ──clone──►  EventSeatingPlan
  "Football Layout"                           "Football - Coldplay June 2026"

Section A (North Stand, Seated) ──clone──►  EventSection A (North Stand, Seated)
  └── Seat A1, A2, A3...       ──clone──►    └── EventSeat A1, A2, A3...

Section B (South Stand, Seated) ──clone──►  EventSection B (South Stand, Seated)
  └── Seat B1, B2, B3...       ──clone──►    └── EventSeat B1, B2, B3...

Section C (East Stand, Seated)  ── ❌ ──►  DELETED by organizer (stage goes here)

                                ── NEW ──►  EventSection: "Ground Standing" (Standing, Cap: 500)
                                              └── EventSeat GA-001 to GA-500 (generated)

Landmark: Gate 1               ──clone──►  EventLandmark: Gate 1
                                ── NEW ──►  EventLandmark: "Main Stage" (STAGE type)
```

---

# 7) Why This Design is Strong

This schema enforces:

- **Reusable templates** — Stadium owners create base layouts, reused across events
- **Event isolation** — Each event gets its own layout copy, fully independent
- **Flexible customization** — Organizers add/remove sections, add landmarks, create standing areas
- **Mixed section types** — Supports both Seated (individual seats) and Standing (capacity-based slots)
- **Correct pricing model** — TicketType → SectionTicketType mapping at event section level
- **Concurrency safety** — Stored Procedures (sp_HoldSeat) called via Dapper for atomic operations
- **Clean data access** — EF Core for CRUD, Dapper for reads and concurrency-critical operations
- **Clean separation of concerns** — Template Layer vs Event Layer vs Pricing vs Booking
- **Security isolation** — Auth data in separate DB from domain data
- **Scalability** — Stateless app + SQL as single source of truth + Redis caching
- **Auditability** — AuthAuditLog + SeatLockCleanupLog
