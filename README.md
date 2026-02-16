# 🏟️ ArenaOps — Stadium Event & Seat Booking System

A microservice-based platform for managing stadium seating layouts, events, and concurrency-safe ticket booking with real-time seat updates.

---

## 🎯 What is ArenaOps?

ArenaOps is a centralized digital platform that enables:

- **Stadium Owners** to design reusable seating layout templates
- **Event Organizers** to clone and customize layouts per event (football, cricket, concerts, etc.)
- **Users** to discover nearby events, pick seats in real-time, and book tickets securely
- **Admins** to approve venues, monitor bookings, and view analytics

### Key Highlights

- 🔒 **Concurrency-safe seat booking** — Stored Procedures ensure no double-bookings
- ⚡ **Real-time seat updates** — SignalR broadcasts seat status changes instantly
- 🎭 **Flexible layouts** — Supports both seated and standing sections per event
- 🏗️ **Event-level customization** — Organizers adapt base templates for each event type
- 🌍 **Location-based discovery** — Find nearby events using geolocation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Next.js (BFF Proxy)         │
│   Server Components + Client UI    │
│   Route Handlers → Backend APIs    │
└──────┬────────────────────┬────────┘
       │                    │
┌──────▼──────┐    ┌───────▼────────┐
│ Auth Service│    │  Core Service  │
│  (Identity) │    │   (Business)   │
│  EF Core    │    │ EF Core+Dapper │
│  JWT (RSA)  │    │ Stored Procs   │
│             │    │ SignalR Hub    │
└──────┬──────┘    └───────┬────────┘
       │                    │
┌──────▼──────┐    ┌───────▼────────┐
│  AuthDB     │    │   CoreDB       │
│ (SQL Server)│    │ (SQL Server)   │
└─────────────┘    └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │     Redis      │
                   │ Cache + Queue  │
                   └────────────────┘
```

| Service | Responsibility |
|---------|---------------|
| **ArenaOps.AuthService** | User identity, JWT (RSA key pair), roles, refresh tokens |
| **ArenaOps.CoreService** | Stadiums, layouts, events, booking, payments, location, SignalR |
| **Next.js Frontend** | SSR pages, seat picker UI, BFF proxy (eliminates CORS) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Auth Backend** | ASP.NET Core, C#, EF Core, SQL Server |
| **Core Backend** | ASP.NET Core, C#, EF Core + Dapper + Stored Procedures, SQL Server, SignalR, Redis |
| **Frontend** | Next.js (App Router), TypeScript, SVG seat rendering, SignalR client |
| **Payment** | Razorpay / Stripe integration |
| **Infrastructure** | Serilog (Docker Compose optional) |

---

## 📁 Project Structure

```
ARENAOPS/
├── BACKEND/
│   ├── ArenaOps.AuthService/       # Auth microservice (JWT, roles, users)
│   ├── ArenaOps.CoreService/       # Core microservice (stadiums, events, booking)
│   └── ArenaOps.Shared/            # Shared DTOs, constants
├── FRONTEND/
│   └── arenaops-web/               # Next.js app (BFF + UI)
├── docs/                           # Project documentation
│   ├── 01-Description.md           # Project overview & scope
│   ├── 02-High-Level-Architecture.md # Architecture & design decisions
│   ├── 03-Database.md              # Full database schema (Auth + Core)
│   ├── 04-Api-Documentation.md     # All API endpoints by module
│   └── 05-Weekly-Plan.md           # 6-week implementation plan
└── docs/                           # Project documentation
└── docker-compose.yml.example      # Optional local orchestration
```

---

## 🔑 Core Concepts

### Seat Booking Lifecycle

```
Available → Held (2 min lock) → Confirmed (after payment)
                 ↓ (timeout)
              Available (auto-released by background job)
```

- **Seat hold** uses `sp_HoldSeat` stored procedure via Dapper for atomic concurrency safety
- **Expired holds** cleaned up by `sp_CleanupExpiredHolds` every 1-2 minutes
- **Booking confirmation** via `sp_ConfirmBookingSeats` after payment webhook

### Event Layout Customization

```
Stadium Owner creates base templates (Football, Concert, Cricket)
        ↓
Organizer clones template for their event
        ↓
Organizer customizes (add stage, standing area, remove sections)
        ↓
Layout locked → EventSeats generated → Event goes Live
```

### Section Types

| Type | Booking Model |
|------|--------------|
| **Seated** | User picks a specific seat (row + number) |
| **Standing** | User buys a capacity slot (e.g., General Admission) |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Approve stadiums, manage users, view analytics |
| **Stadium Owner** | Create stadiums, design base layout templates |
| **Organizer** | Create events, clone & customize layouts, manage tickets |
| **User** | Browse events, book seats, make payments |

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) folder:

| Document | Contents |
|----------|---------|
| [01-Description](docs/01-Description.md) | Project overview, scope, features, tech stack |
| [02-Architecture](docs/02-High-Level-Architecture.md) | System diagram, microservice design, data access strategy, SignalR |
| [03-Database](docs/03-Database.md) | Full schema for AuthDB + CoreDB, stored procedures, indexes |
| [04-API Docs](docs/04-Api-Documentation.md) | All endpoints by module with auth requirements |
| [05-Weekly Plan](docs/05-Weekly-Plan.md) | 6-week implementation plan with team assignments |

---

## 🚀 Getting Started (Coming Soon)

```bash
# Prerequisites: Node.js 18+, .NET 8 SDK, SQL Server, Redis
# (Optional: Docker for simplified infrastructure setup)

# 1. Clone the repo
git clone https://github.com/ArenaOps/arenaops-stadium-management.git
cd arenaops-stadium-management

# 2. Setup Infrastructure (Choose A or B)
# Option A: Standalone SQL Server & Redis (Manual Install)
# Option B: Docker (Optional)
# cp docker-compose.yml.example docker-compose.yml
# docker-compose up -d

# 3. Run Auth Service
cd BACKEND/ArenaOps.AuthService/ArenaOps.AuthService.API
dotnet run

# 4. Run Core Service
cd BACKEND/ArenaOps.CoreService/ArenaOps.CoreService.API
dotnet run

# 5. Run Frontend
cd FRONTEND/arenaops-web
npm install && npm run dev
```

---

## 📄 License

This project is developed as part of an academic/portfolio project.
