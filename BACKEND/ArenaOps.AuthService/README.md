# ArenaOps.AuthService

## Overview
Standalone authentication microservice for the ArenaOps platform, responsible for user identity, JWT authentication with RSA key pair, and role management.

## Architecture
This service follows **Clean Architecture** principles with three layers:

```
ArenaOps.AuthService/
├── ArenaOps.AuthService.API/          # Presentation Layer (Web API)
│   ├── Controllers/                   # API endpoints
│   ├── Program.cs                     # Application entry point
│   └── appsettings.json              # Configuration
│
├── ArenaOps.AuthService.Core/         # Domain Layer (Business Logic)
│   ├── Entities/                     # Domain entities (User, Role, etc.)
│   ├── Interfaces/                   # Service & repository interfaces
│   └── Services/                     # Business logic services
│
└── ArenaOps.AuthService.Infrastructure/  # Infrastructure Layer (Data Access)
    ├── Data/                         # EF Core DbContext
    ├── Repositories/                 # Repository implementations
    └── Migrations/                   # EF Core migrations
```

## Responsibilities
- **User Registration & Login**
- **JWT Token Generation** with RSA Private Key
- **Refresh Token Rotation**
- **Role Management** (Admin, Stadium Owner, Organizer, User)
- **Password Reset**
- **Audit Logging** (login attempts, role changes)

## Database
- **Database Name**: `ArenaOps_AuthDB`
- **Data Access**: Entity Framework Core
- **Tables**: Users, Roles, UserRoles, RefreshTokens, AuthAuditLog

## Technology Stack
- **.NET 9.0**
- **ASP.NET Core Web API**
- **Entity Framework Core**
- **SQL Server**
- **JWT Authentication** (RSA key pair)

## Project Status
✅ **COMPLETED**: Solution structure created with Clean Architecture layers  
✅ **COMPLETED**: Project references configured  
✅ **COMPLETED**: Solution compiles successfully  

## Next Steps (Week 1, Day 2)
1. Create Auth DB entities (Users, Roles, UserRoles, RefreshTokens, AuthAuditLog)
2. Set up EF Core DbContext
3. Create initial migration
4. Run migration to create database tables

## Build & Run
```bash
# Build the solution
dotnet build ArenaOps.AuthService.sln

# Run the API
cd ArenaOps.AuthService.API
dotnet run
```

## Dependencies
- **API** → Core, Infrastructure
- **Infrastructure** → Core
- **Core** → (no dependencies)

---
**Created**: 2026-02-13  
**Task**: ARENA-6 - Create Auth Service with Clean Architecture
