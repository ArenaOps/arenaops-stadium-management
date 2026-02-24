using System.Text.Json;
using ArenaOps.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace ArenaOps.Shared.Middleware;

/// <summary>
/// Redis-backed rate limiting middleware using Fixed Window Counter algorithm.
/// 
/// Algorithm:
///   - Each request increments a Redis counter keyed by IP + path
///   - The key expires after the configured window (e.g. 60 seconds)
///   - If the counter exceeds the permit limit, returns 429 Too Many Requests
///
/// Behavior:
///   - Matches request path against configured rules (first match wins)
///   - Falls back to a global limit if no specific rule matches
///   - If Redis is unavailable, requests pass through (fail-open)
///   - Adds standard rate limit headers to responses
/// </summary>
public class RedisRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConnectionMultiplexer _redis;
    private readonly RateLimitSettings _settings;
    private readonly ILogger<RedisRateLimitMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RedisRateLimitMiddleware(
        RequestDelegate next,
        IConnectionMultiplexer redis,
        IOptions<RateLimitSettings> settings,
        ILogger<RedisRateLimitMiddleware> logger)
    {
        _next = next;
        _redis = redis;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip if rate limiting is disabled
        if (!_settings.Enabled)
        {
            await _next(context);
            return;
        }

        // Determine which rule applies (first match wins) or fall back to global
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "/";
        var matchedRule = _settings.Rules
            .FirstOrDefault(r => path.Equals(r.PathPattern, StringComparison.OrdinalIgnoreCase));

        int permitLimit;
        int windowSeconds;
        string ruleName;

        if (matchedRule != null)
        {
            permitLimit = matchedRule.PermitLimit;
            windowSeconds = matchedRule.WindowSeconds;
            ruleName = matchedRule.Name;
        }
        else
        {
            permitLimit = _settings.GlobalPermitLimit;
            windowSeconds = _settings.GlobalWindowSeconds;
            ruleName = "global";
        }

        // Build partition key: per-IP, append userId if authenticated
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userId = context.User?.FindFirst("userId")?.Value
                  ?? context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        var redisKey = string.IsNullOrEmpty(userId)
            ? $"ratelimit:{ruleName}:{clientIp}:{path}"
            : $"ratelimit:{ruleName}:{clientIp}:{userId}:{path}";

        try
        {
            var db = _redis.GetDatabase();
            var currentCount = await db.StringIncrementAsync(redisKey);

            // Set expiry on first request in the window
            if (currentCount == 1)
            {
                await db.KeyExpireAsync(redisKey, TimeSpan.FromSeconds(windowSeconds));
            }

            // Get remaining TTL for headers
            var ttl = await db.KeyTimeToLiveAsync(redisKey);
            var retryAfterSeconds = ttl.HasValue ? (int)Math.Ceiling(ttl.Value.TotalSeconds) : windowSeconds;

            // Add rate limit headers to every response
            context.Response.Headers["X-RateLimit-Limit"] = permitLimit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = Math.Max(0, permitLimit - currentCount).ToString();
            context.Response.Headers["X-RateLimit-Reset"] = retryAfterSeconds.ToString();

            if (currentCount > permitLimit)
            {
                _logger.LogWarning(
                    "Rate limit exceeded: Rule={Rule}, IP={IP}, Path={Path}, Count={Count}/{Limit}",
                    ruleName, clientIp, path, currentCount, permitLimit);

                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.ContentType = "application/json";
                context.Response.Headers["Retry-After"] = retryAfterSeconds.ToString();

                var response = ApiResponse<object>.Fail("RATE_LIMITED", "Too many requests. Please try again later.");
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
                return;
            }
        }
        catch (RedisConnectionException ex)
        {
            // Fail-open: if Redis is down, allow the request through
            _logger.LogError(ex, "Redis unavailable for rate limiting — allowing request through (fail-open)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in rate limiting middleware — allowing request through");
        }

        await _next(context);
    }
}
