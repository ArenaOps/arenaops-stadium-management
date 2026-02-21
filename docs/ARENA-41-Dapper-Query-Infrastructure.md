# ARENA-41: Dapper Query Infrastructure

## Task Overview

Set up the complete Dapper query infrastructure for CoreService to support:
- High-performance database reads (seat maps, nearby stadiums, event listings)
- Stored procedure execution (sp_HoldSeat, sp_CleanupExpiredHolds, sp_ConfirmBookingSeats)
- Concurrency-safe multi-step transactions (booking + payment atomicity)
- Paginated queries for large datasets

This task builds on the existing `DapperContext` (connection factory) and `IDapperContext` (interface) that were already scaffolded.

---

## Files Created

### Application Layer

| File | Path |
|------|------|
| `PagedResult.cs` | `Application/Models/PagedResult.cs` |
| `StoredProcedureResult.cs` | `Application/Models/StoredProcedureResult.cs` |
| `IDapperQueryService.cs` | `Application/Interfaces/IDapperQueryService.cs` |

### Infrastructure Layer

| File | Path |
|------|------|
| `DapperExtensions.cs` | `Infrastructure/Data/DapperExtensions.cs` |
| `DapperQueryService.cs` | `Infrastructure/Data/DapperQueryService.cs` |

### Modified Files

| File | Change |
|------|--------|
| `Program.cs` | Registered `IDapperQueryService` → `DapperQueryService` as Scoped |
| `StadiumController.cs` | Resolved git merge conflicts |

---

## Architecture

```
Controller / Service
    ↓ injects
IDapperQueryService (Application layer — interface)
    ↓ implemented by
DapperQueryService (Infrastructure layer — uses DapperExtensions internally)
    ↓ gets connections from
IDapperContext → DapperContext (reads "CoreDb" from appsettings)
    ↓
SqlConnection → SQL Server
```

### Why This Layering?

- **Application layer** defines what it needs (interfaces + models)
- **Infrastructure layer** provides how it works (implementations)
- Controllers depend only on interfaces — never on Dapper or SqlConnection directly
- This follows Clean Architecture and allows easy testing with mocked interfaces

---

## File-by-File Explanation

### 1. PagedResult\<T\> — `Application/Models/PagedResult.cs`

Generic container for paginated query results.

**Properties:**
- `Items` — the data for the current page
- `TotalCount` — total matching records across all pages
- `Page` — current page number (1-based)
- `PageSize` — items per page
- `TotalPages` — calculated: `ceil(TotalCount / PageSize)`
- `HasNextPage` / `HasPreviousPage` — navigation helpers

**Use case:** Any endpoint returning large datasets:
- `GET /api/stadiums/nearby` — paginated stadium results
- `GET /api/events` — paginated event listings
- Seat map queries with many seats per section

---

### 2. StoredProcedureResult — `Application/Models/StoredProcedureResult.cs`

Uniform wrapper for stored procedure execution results. Two versions:

**StoredProcedureResult (base):**
- `Success` — whether the SP succeeded
- `RowsAffected` — number of rows affected
- `Message` — optional status or error message
- Factory methods: `Ok()`, `Fail()`

**StoredProcedureResult\<T\> (generic):**
- Inherits everything from base
- Adds `Data` — typed result from the SP
- Factory methods: `Ok(data)`, `Fail(message)`

**Use cases:**
- `sp_HoldSeat` → returns `StoredProcedureResult<HoldResult>` with seat hold details
- `sp_CleanupExpiredHolds` → returns `StoredProcedureResult` with rows cleaned count
- `sp_ConfirmBookingSeats` → returns `StoredProcedureResult<BookingConfirmation>`

---

### 3. IDapperQueryService — `Application/Interfaces/IDapperQueryService.cs`

The main contract with 11 methods in 5 groups:

**QUERY (reads):**
- `QueryAsync<T>` — list of results
- `QueryFirstOrDefaultAsync<T>` — single result or null
- `QuerySingleAsync<T>` — single result (throws if missing)
- `ExecuteScalarAsync<T>` — single value (COUNT, SUM, etc.)
- `QueryPagedAsync<T>` — paginated results with count

**EXECUTE (writes):**
- `ExecuteAsync` — INSERT/UPDATE/DELETE, returns rows affected

**STORED PROCEDURES:**
- `ExecuteStoredProcAsync<T>` — SP returning single typed result
- `QueryStoredProcAsync<T>` — SP returning list of results
- `ExecuteStoredProcNonQueryAsync` — SP with no result set

**MULTI-MAPPING:**
- `QueryMultiMapAsync<T1, T2, TReturn>` — JOIN query mapping two tables to one object

**TRANSACTIONS:**
- `ExecuteInTransactionAsync(action)` — multi-step atomic writes
- `ExecuteInTransactionAsync<T>(action)` — multi-step atomic writes with return value

---

### 4. DapperExtensions — `Infrastructure/Data/DapperExtensions.cs`

Static extension methods on `IDbConnection` for common patterns.

**SP shortcuts** — automatically set `CommandType.StoredProcedure`:
- `QueryStoredProcAsync<T>()` — SP → list
- `QueryStoredProcSingleAsync<T>()` — SP → single result
- `ExecuteStoredProcAsync()` — SP → execute only

**Helpers:**
- `GetPaginationParams(page, pageSize)` — calculates offset, clamps pageSize to 1-100
- `CreateInClauseParams<T>()` — builds params for `WHERE x IN @list` queries
- `CreateWithOutput()` — builds `DynamicParameters` with OUTPUT direction for SP output params

**Why separate from DapperQueryService?**
These are used in two places:
1. Internally by `DapperQueryService` methods
2. Directly by callers inside `ExecuteInTransactionAsync` where they work with raw `IDbConnection`

---

### 5. DapperQueryService — `Infrastructure/Data/DapperQueryService.cs`

The main implementation. Three responsibilities:

**Connection lifecycle:**
Every method opens a connection via `IDapperContext`, uses it, and auto-disposes it. Callers never manage connections.

**Performance logging:**
Every method uses `Stopwatch` to measure execution time and logs it via `ILogger`:
- `LogDebug` for successful operations with timing
- `LogError` for failures with timing
- `LogCritical` for transaction rollback failures

**Error handling:**
All exceptions are logged with context (SQL, timing, type) and re-thrown. Transaction methods include explicit rollback with a nested try-catch for rollback failures.

**DI Registration:** Scoped (not Singleton) — each HTTP request gets its own instance so logging includes per-request context.

---

## Why Transactions?

### The Problem

Some operations involve **multiple database writes that must succeed or fail together**:

```
Booking Confirmation Flow:
1. Verify held seats still belong to user
2. EXEC sp_ConfirmBookingSeats → mark seats as Confirmed
3. Update Booking status → Confirmed
4. Create Payment record
```

If step 3 fails but step 2 already ran, you have confirmed seats with no booking record — **data inconsistency**.

### The Solution

`ExecuteInTransactionAsync` wraps all steps in a single database transaction:

```csharp
await dapper.ExecuteInTransactionAsync(async (conn, tx) =>
{
    await conn.ExecuteAsync("EXEC sp_ConfirmBookingSeats @BookingId", 
        new { BookingId }, transaction: tx);
    
    await conn.ExecuteAsync(
        "UPDATE Booking SET Status = 'Confirmed' WHERE BookingId = @BookingId", 
        new { BookingId }, transaction: tx);
    
    await conn.ExecuteAsync(
        "INSERT INTO Payment (BookingId, Amount, Status) VALUES (@BookingId, @Amount, 'Completed')", 
        new { BookingId, Amount }, transaction: tx);
});
// All 3 operations commit together — or all rollback on any failure
```

### When to Use Transactions vs Single SP Calls

| Scenario | Use |
|----------|-----|
| Hold a single seat | `ExecuteStoredProcAsync` — SP is self-contained and atomic |
| Clean up expired holds | `ExecuteStoredProcNonQueryAsync` — single independent operation |
| Confirm booking + create payment | `ExecuteInTransactionAsync` — multiple steps must be atomic |
| Clone event layout (copy sections + seats + landmarks) | `ExecuteInTransactionAsync` — multi-table insert |

---

## How to Use Stored Procedure Services

### 1. SP Returning a Single Result

```csharp
// sp_HoldSeat — hold a seat for a user, returns hold details
var result = await _dapper.ExecuteStoredProcAsync<HoldResult>(
    "sp_HoldSeat",
    new { EventSeatId = seatId, UserId = userId, HoldDurationMinutes = 10 }
);

if (result.Success)
{
    var holdData = result.Data; // HoldResult { SeatId, ExpiresAt, ... }
}
else
{
    // result.Message = "Seat already held by another user"
}
```

### 2. SP Returning Multiple Rows

```csharp
// sp_GetEventSeatMap — get all seats for an event section
var seats = await _dapper.QueryStoredProcAsync<SeatDto>(
    "sp_GetEventSeatMap",
    new { EventId = eventId, SectionId = sectionId }
);
```

### 3. SP With No Result (Side-Effect Only)

```csharp
// sp_CleanupExpiredHolds — release seats with expired holds
var result = await _dapper.ExecuteStoredProcNonQueryAsync("sp_CleanupExpiredHolds");
// result.RowsAffected = number of holds cleaned up
```

### 4. SP Inside a Transaction

```csharp
await _dapper.ExecuteInTransactionAsync(async (conn, tx) =>
{
    // Use extension methods directly on IDbConnection
    await conn.ExecuteStoredProcAsync("sp_ConfirmBookingSeats", 
        new { BookingId }, transaction: tx);
    
    await conn.ExecuteAsync(
        "INSERT INTO Payment ...", paymentParams, transaction: tx);
});
```

---

## How to Use Other Services

### Simple Query

```csharp
var stadiums = await _dapper.QueryAsync<StadiumDto>(
    "SELECT * FROM Stadium WHERE City = @City",
    new { City = "Mumbai" }
);
```

### Single Record Lookup

```csharp
var stadium = await _dapper.QueryFirstOrDefaultAsync<StadiumDto>(
    "SELECT * FROM Stadium WHERE StadiumId = @Id",
    new { Id = stadiumId }
);
```

### Scalar Value

```csharp
var count = await _dapper.ExecuteScalarAsync<int>(
    "SELECT COUNT(*) FROM EventSeat WHERE Status = 'Available' AND EventId = @EventId",
    new { EventId }
);
```

### Paginated Query

```csharp
var result = await _dapper.QueryPagedAsync<StadiumDto>(
    countSql: "SELECT COUNT(*) FROM Stadium WHERE City = @City",
    dataSql: "SELECT * FROM Stadium WHERE City = @City ORDER BY Name OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
    parameters: new { City = "Mumbai" },
    page: 1,
    pageSize: 20
);
// result.Items, result.TotalCount, result.TotalPages, result.HasNextPage
```

### JOIN Query (Multi-Mapping)

```csharp
var sectionsWithSeats = await _dapper.QueryMultiMapAsync<SectionDto, SeatDto, SectionWithSeatsDto>(
    @"SELECT s.*, st.* FROM Section s 
      INNER JOIN Seat st ON s.SectionId = st.SectionId 
      WHERE s.SeatingPlanId = @PlanId",
    (section, seat) => new SectionWithSeatsDto { Section = section, Seat = seat },
    new { PlanId = planId },
    splitOn: "SeatId"
);
```

---

## NuGet Dependencies

| Package | Version | Project |
|---------|---------|---------|
| `Dapper` | 2.1.66 | Infrastructure |
| `Microsoft.Data.SqlClient` | 6.1.4 | Infrastructure |

---

## DI Registration in Program.cs

```csharp
// Connection factory — Singleton (connection string never changes)
builder.Services.AddSingleton<IDapperContext, DapperContext>();

// Query service — Scoped (per-request for logging context)
builder.Services.AddScoped<IDapperQueryService, DapperQueryService>();
```

---

## What's Next

| Week | Feature | Dapper Method |
|------|---------|---------------|
| Week 2 | Write SP SQL scripts | Scripts ready, infrastructure calls them |
| Week 3 | Layout cloning | `ExecuteInTransactionAsync` (multi-table copy) |
| Week 4 | Seat hold + booking | `ExecuteStoredProcAsync` → `sp_HoldSeat` |
| Week 4 | Expired hold cleanup | `ExecuteStoredProcNonQueryAsync` → `sp_CleanupExpiredHolds` |
| Week 5 | Payment confirmation | `ExecuteInTransactionAsync` → `sp_ConfirmBookingSeats` + Payment |
| Week 5 | Nearby stadium search | `QueryPagedAsync` with Haversine SQL |
