# ARENA-47: Redis Caching Infrastructure

## Task Overview

Set up Redis caching for the CoreService to reduce database load on frequently accessed data (stadium lists, seating plans, event layouts). This task covers the full infrastructure — packages, config, interface, implementation, DI registration, health check, and cache key strategy.

---

## Architecture

```
Controller / Service
    ↓ injects
ICacheService (Application layer — interface)
    ↓ implemented by
RedisCacheService (Infrastructure layer)
    ↓ uses
IDistributedCache → StackExchange.Redis → Redis Server (localhost:6379)
IConnectionMultiplexer → prefix-based key scanning + bulk delete
```

---

## Files Created

### Application Layer

| File | Path | Purpose |
|------|------|---------|
| `ICacheService.cs` | `Application/Interfaces/` | Generic cache service contract with 6 methods |
| `CacheKeys.cs` | `Application/Constants/` | Centralized cache key patterns for all entities |
| `CacheSettings.cs` | `Application/Models/` | Strongly-typed config model for TTL settings |

### Infrastructure Layer

| File | Path | Purpose |
|------|------|---------|
| `RedisCacheService.cs` | `Infrastructure/Services/` | Full Redis implementation of ICacheService |

### Modified Files

| File | Change |
|------|--------|
| `API.csproj` | Added `Microsoft.Extensions.Caching.StackExchangeRedis` + `AspNetCore.HealthChecks.Redis` |
| `Infrastructure.csproj` | Added `StackExchange.Redis` + `Microsoft.Extensions.Caching.Abstractions` + `Microsoft.Extensions.Options` |
| `appsettings.json` | Added Redis connection string + CacheSettings section |
| `appsettings.Development.json` | Added Redis connection string + CacheSettings with dev TTLs |
| `Program.cs` | Registered Redis cache, IConnectionMultiplexer, ICacheService, CacheSettings, Redis health check, DapperQueryService |

---

## NuGet Packages

### API Layer
| Package | Version | Why |
|---------|---------|-----|
| `Microsoft.Extensions.Caching.StackExchangeRedis` | 8.0.12 | Provides `IDistributedCache` implementation backed by Redis |
| `AspNetCore.HealthChecks.Redis` | 9.0.0 | Redis health monitoring at `/health` endpoint |

### Infrastructure Layer
| Package | Version | Why |
|---------|---------|-----|
| `StackExchange.Redis` | 2.8.16 | Direct Redis connection for advanced ops (prefix key scanning, bulk delete) |
| `Microsoft.Extensions.Caching.Abstractions` | 8.0.0 | `IDistributedCache` interface used by RedisCacheService |
| `Microsoft.Extensions.Options` | 8.0.2 | `IOptions<CacheSettings>` pattern for reading config |

---

## Configuration

### appsettings.Development.json

```json
{
  "Redis": {
    "ConnectionString": "localhost:6379",
    "InstanceName": "ArenaOps_Dev_"
  },
  "CacheSettings": {
    "DefaultTTLMinutes": 5,
    "StadiumListTTLMinutes": 2,
    "SeatingPlanTTLMinutes": 10
  }
}
```

### appsettings.json (Production)

```json
{
  "Redis": {
    "ConnectionString": "localhost:6379",
    "InstanceName": "ArenaOps_"
  },
  "CacheSettings": {
    "DefaultTTLMinutes": 5,
    "StadiumListTTLMinutes": 2,
    "SeatingPlanTTLMinutes": 10
  }
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `ConnectionString` | `localhost:6379` | Redis server address (Docker container) |
| `InstanceName` | `ArenaOps_Dev_` | Prefix for all Redis keys — prevents collisions if multiple apps share Redis |
| `DefaultTTLMinutes` | 5 | Default cache expiry time |
| `StadiumListTTLMinutes` | 2 | Stadium lists expire faster (change more often) |
| `SeatingPlanTTLMinutes` | 10 | Seating plans are stable, cache longer |

---

## ICacheService — Interface Methods

| Method | Signature | Purpose |
|--------|-----------|---------|
| `GetAsync<T>` | `(string key) → T?` | Get cached item by key, returns null on miss |
| `SetAsync<T>` | `(string key, T value, TimeSpan? ttl)` | Store item with optional TTL |
| `RemoveAsync` | `(string key)` | Delete one specific cached item |
| `RemoveByPrefixAsync` | `(string prefix)` | Delete ALL keys matching a prefix (e.g., `"stadium:"` clears all stadium cache) |
| `ExistsAsync` | `(string key) → bool` | Check if a key exists in cache |
| `GetOrSetAsync<T>` | `(string key, Func<Task<T>> factory, TimeSpan? ttl) → T` | **Cache-aside pattern**: return cached or call factory → cache → return |

---

## CacheKeys — Key Patterns

| Key Pattern | Example | Used For |
|---|---|---|
| `stadium:{id}` | `stadium:3fa85f64-5717-4562` | Single stadium details |
| `stadiums:list` | `stadiums:list` | All stadiums list |
| `stadiums:list:city:{city}` | `stadiums:list:city:mumbai` | Filtered by city |
| `stadiums:list:owner:{id}` | `stadiums:list:owner:abc123` | Filtered by owner |
| `seatingplan:{id}` | `seatingplan:xyz789` | Single seating plan |
| `seatingplans:stadium:{id}` | `seatingplans:stadium:abc123` | All plans for a stadium |
| `section:{id}` | `section:def456` | Single section |
| `sections:plan:{id}` | `sections:plan:xyz789` | All sections in a plan |
| `seats:section:{id}` | `seats:section:def456` | All seats in a section |
| `event:{id}` | `event:ghi012` | Single event |
| `event:{id}:layout` | `event:ghi012:layout` | Event seat layout |

---

## RedisCacheService — Design Decisions

| Decision | Why |
|----------|-----|
| **Fail-safe try-catch** | Every method catches exceptions. If Redis is down, app continues working without cache. Cache failures log as `Warning`, never crash the app. |
| **JSON serialization** | Uses `System.Text.Json` with camelCase. Redis stores strings — objects are serialized before storing. |
| **Two Redis connections** | `IDistributedCache` for standard get/set/remove. `IConnectionMultiplexer` for Redis `KEYS` command to scan and bulk-delete by prefix. |
| **GetOrSetAsync (cache-aside)** | Most commonly used: check cache → HIT returns in 1-2ms, MISS queries DB → stores result → returns. |

---

## DI Registration (Program.cs)

```csharp
// Redis distributed cache
builder.Services.AddStackExchangeRedisCache(options => {
    options.Configuration = redisConnectionString;
    options.InstanceName = redisInstanceName;
});

// Direct Redis connection (for prefix-based key operations)
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
    ConnectionMultiplexer.Connect(redisConnectionString));

// Cache settings from appsettings
builder.Services.Configure<CacheSettings>(
    builder.Configuration.GetSection("CacheSettings"));

// Cache service
builder.Services.AddScoped<ICacheService, RedisCacheService>();

// Health check includes Redis
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString!, name: "SQL Server")
    .AddRedis(redisConnectionString, name: "Redis");
```

---

## Use Cases — How to Use in Services

### Use Case 1: Cache a Single Stadium

```csharp
public class StadiumService(ICacheService cache, CoreDbContext db)
{
    public async Task<StadiumDto?> GetByIdAsync(Guid id)
    {
        return await cache.GetOrSetAsync(
            CacheKeys.Stadium(id),          // key: "stadium:{guid}"
            async () => await db.Stadiums.FindAsync(id),
            TimeSpan.FromMinutes(5)
        );
    }
}
```

### Use Case 2: Cache a List

```csharp
public async Task<List<StadiumDto>> GetAllAsync()
{
    return await cache.GetOrSetAsync(
        CacheKeys.StadiumList,              // key: "stadiums:list"
        async () => await db.Stadiums
            .Where(s => s.IsActive)
            .Select(s => new StadiumDto { ... })
            .ToListAsync(),
        TimeSpan.FromMinutes(2)
    );
}
```

### Use Case 3: Invalidate on Create

```csharp
public async Task CreateAsync(CreateStadiumDto dto)
{
    var stadium = new Stadium { ... };
    db.Stadiums.Add(stadium);
    await db.SaveChangesAsync();

    // Invalidate list cache — next GET will rebuild it
    await cache.RemoveAsync(CacheKeys.StadiumList);
}
```

### Use Case 4: Invalidate on Update

```csharp
public async Task UpdateAsync(Guid id, UpdateStadiumDto dto)
{
    var stadium = await db.Stadiums.FindAsync(id);
    stadium.Name = dto.Name;
    await db.SaveChangesAsync();

    // Invalidate both specific + list
    await cache.RemoveAsync(CacheKeys.Stadium(id));
    await cache.RemoveAsync(CacheKeys.StadiumList);
}
```

### Use Case 5: Invalidate on Delete (Prefix-based)

```csharp
public async Task DeleteAsync(Guid id)
{
    var stadium = await db.Stadiums.FindAsync(id);
    db.Stadiums.Remove(stadium);
    await db.SaveChangesAsync();

    // Remove ALL stadium-related cache
    await cache.RemoveByPrefixAsync(CacheKeys.StadiumPrefix);
}
```

### Use Case 6: Cache Seating Plan with Longer TTL

```csharp
public async Task<SeatingPlanDto?> GetPlanAsync(Guid planId)
{
    return await cache.GetOrSetAsync(
        CacheKeys.SeatingPlan(planId),
        async () => await db.SeatingPlans
            .Include(p => p.Sections)
            .ThenInclude(s => s.Seats)
            .FirstOrDefaultAsync(p => p.Id == planId),
        TimeSpan.FromMinutes(10)  // longer TTL — plans change rarely
    );
}
```

### Use Case 7: Cache Event Seat Layout (Booking Page)

```csharp
public async Task<EventLayoutDto?> GetEventLayoutAsync(Guid eventId)
{
    return await cache.GetOrSetAsync(
        CacheKeys.EventLayout(eventId),
        async () => await dapperQuery.QueryAsync<EventLayoutDto>(
            "SELECT * FROM vw_EventSeatLayout WHERE EventId = @EventId",
            new { EventId = eventId }
        ),
        TimeSpan.FromMinutes(1)  // short TTL — seats change during booking
    );
}
```

---

## Invalidation Patterns Summary

| Scenario | What to Invalidate |
|----------|-------------------|
| Stadium created | `stadiums:list` |
| Stadium updated | `stadium:{id}`, `stadiums:list` |
| Stadium deleted | All `stadium:*` via prefix |
| SeatingPlan created | `seatingplans:stadium:{stadiumId}` |
| SeatingPlan updated | `seatingplan:{id}`, `seatingplans:stadium:{stadiumId}` |
| Section added/removed | `sections:plan:{planId}`, `seatingplan:{planId}` |
| Seat updated | `seats:section:{sectionId}` |
| Event layout changed | `event:{id}:layout` |

---

## Docker Setup (Prerequisites)

```powershell
# Start Redis
docker run -d --name myredis -p 6379:6379 redis

# Verify
docker exec myredis redis-cli ping        # → PONG
docker exec myredis redis-cli keys "*"     # → see all keys
docker exec myredis redis-cli flushall     # → clear everything

# Stop/Start
docker stop myredis
docker start myredis
```

---

## Health Check

`GET /health` returns the status of both SQL Server and Redis:
- **Healthy** → Both connected
- **Unhealthy** → One or both are down
- If Redis is down, the app still runs — cache operations gracefully fall through to database

---

## Performance Impact

| Without Cache | With Cache |
|---|---|
| Every `GET /api/stadiums` → SQL query (~50-100ms) | First call → SQL → cache. Next 100 calls → Redis (~1-2ms) |
| 500 users viewing same event seat map → 500 identical DB queries | 1 DB query + 499 cache hits |
| `/health` only checks SQL | `/health` checks both SQL + Redis |

---

## What's Next

| Week | Feature | How Cache Is Used |
|------|---------|-------------------|
| Week 2 | Stadium CRUD | Cache stadium reads, invalidate on write |
| Week 2 | SeatingPlan CRUD | Cache plan reads, invalidate on update |
| Week 3 | Event layout reads | Cache event layout (Dapper query + Redis) |
| Week 4 | Seat map for booking | Heavy caching — seat availability from Redis |
| Week 5 | Location-based search | Cache nearby stadium results by city/region |
