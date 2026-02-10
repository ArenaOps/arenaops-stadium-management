# STADIUM EVENT & SEAT BOOKING SYSTEM — ArenaOps

## 1) Project Overview

The Stadium Event and Seat Booking Management System (ArenaOps) is a centralized digital platform that enables stadium owners, event organizers, and attendees to manage and utilize stadium seating, events, and ticket bookings in a structured and scalable manner. The system provides a reusable seating plan (template) that represents the physical layout of a stadium, including sections, seats, and landmarks. This seating plan can be **cloned and customized per event**, allowing organizers to adapt layouts for different event types (football, cricket, concerts, etc.) while maintaining the base template for reuse.

The platform supports secure, concurrency-safe seat booking by implementing a seat lifecycle model (Available → Held → Confirmed), preventing double bookings even under high traffic. It also provides **real-time seat status updates** via SignalR, ensuring all users viewing a seat map see changes instantly. It also integrates location-based discovery, allowing users to find nearby stadiums and events based on their geographical location.

### Architecture Style

ArenaOps follows a **microservice architecture** with two independently deployable backend services:

| Service | Name | Responsibility |
|---------|------|----------------|
| **Service 1** | `ArenaOps.AuthService` | User identity, authentication, authorization, role management |
| **Service 2** | `ArenaOps.CoreService` | Stadium, Seating, Events, Booking, Payments, Location, Admin |

The frontend is built with **Next.js (App Router)**, which acts as a Backend-For-Frontend (BFF) proxy, routing browser requests to the appropriate backend service.

**Scope of the system includes:**

- Designing and managing reusable stadium seating layout templates
- **Event-level layout customization** — organizers clone and modify layouts per event
- **Standing sections** for concerts and general admission areas
- Creating and managing events and time slots
- Defining ticket types and mapping them to sections
- Concurrency-safe seat booking and payment handling (via **Dapper + Stored Procedures**)
- **Real-time seat status updates** via SignalR
- Location-based discovery of stadiums and events
- Role-based access control for Admin, Stadium Owner, Organizer, and Users
- Drag-and-drop section positioning for layout customization
- Seat status visualization and booking workflow management

**Out of Scope (What the system does NOT do):**

- It does not provide live video streaming of events.
- It does not handle physical access control (e.g., turnstiles, scanners).
- It does not manage on-site crowd movement or security operations.
- It does not replace external payment gateways (only integrates with them).
- It does not generate physical tickets; it supports only digital tickets.

---

## 2) Core Purpose of the Project

The core purpose of this system is to provide a **reusable, structured, and concurrency-safe seat planning and booking platform** that ensures:

- Accurate representation of real-world stadium layouts
- **Flexible layout customization per event type** (football, cricket, concerts, etc.)
- Support for both **seated and standing sections**
- Safe and reliable seat reservations under high demand
- **Real-time seat status broadcasting** for live booking visualization
- Clear separation between seating design, event scheduling, and pricing
- Scalable architecture capable of handling large audiences
- Seamless discovery of events based on user location
- **Independent scaling and deployment** of authentication and core business logic

At its foundation, the system prioritizes **correctness over convenience**, ensuring that no two users can book the same seat, even during peak traffic.

---

## 3) Target Audience

The system is designed for four primary user groups:

### 1. Stadium Owners
- Manage stadium base layout templates
- Define reusable seating sections, seats, and landmarks
- Create multiple layout variants (Football, Cricket, Concert, etc.)
- Control venue availability

### 2. Event Organizers
- Create and schedule events
- **Clone and customize** a base layout for their specific event
- Add/remove sections, add stage areas, create standing zones
- Define ticket types and pricing per section
- Monitor ticket sales

### 3. End Users (Attendees)
- Discover nearby events
- View **real-time** seat layouts with live availability
- Select and book seats (or standing slots) securely
- Complete payment and receive digital tickets

### 4. System Administrators (Admin)
- Approve stadium and organizer registrations
- Monitor system activity
- Handle disputes and cancellations
- View revenue and booking analytics

---

## 4) Key Features

### A. Seating Plan & Layout Management

- Reusable seating templates per stadium (multiple templates per stadium)
- **Event-level layout customization** — organizers clone base templates and modify for their event
- **Two section types:**
    - **Seated** — individual seats with row/number, user picks a specific seat
    - **Standing** — capacity-based, no individual seats, user buys a "slot" (e.g., General Admission, Ground Floor)
- Logical sections as pricing and management boundaries
- Individual seats with real-world numbering
- Support for inactive seats (aisles, stairs, obstructions)
- Landmarks such as stage, gates, exits, and restrooms
- Drag-and-drop positioning of sections on the stadium map

### B. Event Management

- Events as time-based entities (not seat-based)
- Support for multiple dates and time slots
- **Layout cloning workflow:**
    1. Organizer selects a base template
    2. System clones it into an event-specific layout
    3. Organizer customizes (add/remove sections, add stage, create standing areas)
    4. Layout becomes **immutable once event goes Live**
- Automatic cloning of seats per event (from customized layout)

### C. Ticketing & Pricing

- Separate ticket types (VIP, Premium, Standard, General Admission, Accessible, etc.)
- Ticket types mapped to sections instead of individual seats
- Flexible pricing control per section
- Standing ticket support (capacity-based)

### D. Secure Booking System

- Seat lifecycle: Available → Held → Confirmed
- Time-bound seat holds
- Automatic release of expired holds
- **Concurrency-safe seat locking via Stored Procedures** (called through Dapper)
- Idempotent payment processing with webhook verification
- **Real-time seat status updates via SignalR** — all users see changes instantly

### E. Location-Based Discovery

- Stadiums stored with latitude and longitude
- User location captured via browser or city input
- Nearby stadium and event search using distance calculations
- Map-based event visualization

### F. High-Traffic Handling

- Read-write separation (EF Core for writes, Dapper for reads)
- Seat map caching via Redis
- Rate limiting
- Virtual waiting room for high-demand events
- Stateless backend for horizontal scaling
- Background job for seat hold cleanup

---

## 5) Benefits of the System

### For Stadium Owners

- Centralized digital layout management
- Create multiple reusable templates for different event types
- Reduced manual coordination
- Better visibility of bookings and schedules

### For Event Organizers

- Easy venue selection and booking
- **Flexible layout customization** — adapt base template for their specific event
- Support for mixed layouts (seated + standing sections)
- Clear pricing control through section-based ticketing
- Real-time monitoring of ticket sales

### For Users

- Intuitive seat selection experience with **real-time availability updates**
- Secure and fair booking process
- Easy discovery of nearby events
- Support for both individual seat picks and standing tickets

### For System Reliability

- Strong data consistency via stored procedures
- Reduced risk of double booking
- Scalable design for large events
- **Independent scaling** — Auth handles login spikes independently from booking spikes
- **Security isolation** — Credentials and tokens are in a separate database

---

## 6) Technical Stack

### Backend — Auth Service (`ArenaOps.AuthService`)

- ASP.NET Core Web API
- C#
- SQL Server (dedicated `ArenaOps_AuthDB`)
- **Entity Framework Core** (CRUD operations)
- JWT-based Authentication with **RSA Key Pair** (Private key for signing)
- Refresh Token Rotation
- Audit Logging

### Backend — Core Service (`ArenaOps.CoreService`)

- ASP.NET Core Web API
- C#
- SQL Server (dedicated `ArenaOps_CoreDB`)
- **Entity Framework Core** (CRUD operations — Stadium, Events, Sections, etc.)
- **Dapper + Stored Procedures** (concurrency-critical operations — seat hold, seat cleanup, booking confirmation, seat map reads)
- **SignalR** (real-time seat status broadcasting)
- Redis (for caching, rate limiting, waiting room)
- Background Hosted Services

### Frontend

- **Next.js** (App Router, TypeScript)
- Server Components for SSR/SSG (event discovery, SEO)
- Client Components for interactive features (seat map, layout editor)
- **Route Handlers as BFF Proxy** (browser talks only to Next.js)
- SVG-based seat rendering
- **SignalR Client** for real-time seat updates
- Google Maps / Mapbox / OpenStreetMap for location visualization

### Payment Integration

- Razorpay / Stripe (or mock gateway for development)

### Infrastructure

- Docker Compose for local development orchestration
- Redis for caching and rate limiting
- Serilog for centralized logging

---

## 7) Conclusion

This project provides a robust, scalable, and realistic stadium event and seat booking platform that mirrors the architecture of real-world ticketing systems. By supporting **event-level layout customization** with both seated and standing sections, the system handles diverse event types from football matches to concerts.

The use of **Dapper with stored procedures** for concurrency-critical operations ensures maximum safety for seat locking, while **EF Core** handles standard CRUD operations cleanly. **SignalR** enables real-time seat status broadcasting so all users see live availability.

By separating authentication from core business logic into independent microservices, and by separating seating design, event scheduling, and pricing logic within the core service, the system ensures flexibility, maintainability, and correctness.

Overall, this project demonstrates strong system design principles, real-world applicability, and enterprise-grade backend thinking, making it a valuable and industry-relevant solution for modern event ticketing.
