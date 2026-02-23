# ARENA-47: Redis Caching Infrastructure

## Task Overview

Set up Redis caching for the CoreService to reduce database load on frequently accessed data (stadium lists, seating plans, event layouts).

---

## Architecture

```
Controller / Service → injects ICacheService → RedisCacheService
    → IDistributedCache (StackExchange.Redis) → Redis Server (localhost:6379)
    → IConnectionMultiplexer (for prefix-based bulk delete)
```

---

## Files Created

| File | Layer | Purpose |
|------|-------|---------|
| `ICacheService.cs` | Application/Interfaces | Cache contract: Get, Set, Remove, RemoveByPrefix, Exists, GetOrSet |
| `CacheKeys.cs` | Application/Constants | Centralized key patterns for all entities |
| `CacheSettings.cs` | Application/Models | Configurable TTLs from appsettings |
| `RedisCacheService.cs` | Infrastructure/Services | Full implementation with JSON serialization, fail-safe, prefix invalidation |

## Files Modified

| File | Change |
|------|--------|
| `API.csproj` | +`Microsoft.Extensions.Caching.StackExchangeRedis`, `AspNetCore.HealthChecks.Redis` |
| `Infrastructure.csproj` | +`StackExchange.Redis`, `Microsoft.Extensions.Caching.Abstractions`, `Microsoft.Extensions.Options` |
| `appsettings.json` | +Redis connection + CacheSettings |
| `appsettings.Development.json` | +Redis connection + CacheSettings |
| `Program.cs` | +Redis DI, IConnectionMultiplexer, ICacheService, CacheSettings, Redis health check |

---

## Cache Key Patterns

| Pattern | Example | Entity |
|---------|---------|--------|
| `stadium:{id}` | `stadium:abc-123` | Single stadium |
| `stadiums:list` | `stadiums:list` | All stadiums |
| `seatingplan:{id}` | `seatingplan:xyz-789` | Single seating plan |
| `seatingplans:stadium:{id}` | `seatingplans:stadium:abc-123` | Plans for a stadium |
| `section:{id}` | `section:def-456` | Single section |
| `event:{id}` | `event:ghi-012` | Single event |
| `event:{id}:layout` | `event:ghi-012:layout` | Event seat layout |

---

## Use Cases

### Cache-Aside (Most Common)
```csharp
var stadium = await cache.GetOrSetAsync(
    CacheKeys.Stadium(id),
    async () => await db.Stadiums.FindAsync(id),
    TimeSpan.FromMinutes(5)
);
```

### Invalidate on Update
```csharp
await db.SaveChangesAsync();
await cache.RemoveAsync(CacheKeys.Stadium(id));
await cache.RemoveAsync(CacheKeys.StadiumList);
```

### Bulk Invalidate by Prefix
```csharp
await cache.RemoveByPrefixAsync(CacheKeys.StadiumPrefix); // removes all stadium:* keys
```

---

## Invalidation Patterns

| Scenario | Keys to Remove |
|----------|---------------|
| Stadium created | `stadiums:list` |
| Stadium updated | `stadium:{id}`, `stadiums:list` |
| Stadium deleted | All `stadium:*` via prefix |
| SeatingPlan updated | `seatingplan:{id}`, `seatingplans:stadium:{stadiumId}` |
| Section changed | `sections:plan:{planId}`, `seatingplan:{planId}` |

---

## Prerequisites

```powershell
# Start Redis (from project root)
docker-compose up -d

# Verify
docker-compose ps                              # should show arenaops-redis as running
docker exec arenaops-redis redis-cli ping      # → PONG

# Stop when done
docker-compose down
```

---

## Health Check

`GET /health` checks both SQL Server and Redis. If Redis is down, app still works — cache calls gracefully fall through to DB.
