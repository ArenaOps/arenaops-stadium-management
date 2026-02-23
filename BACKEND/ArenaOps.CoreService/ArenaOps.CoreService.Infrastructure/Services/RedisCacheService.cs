using System.Text.Json;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Application.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly CacheSettings _settings;
    private readonly string _instanceName;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public RedisCacheService(
        IDistributedCache cache,
        IConnectionMultiplexer redis,
        ILogger<RedisCacheService> logger,
        IOptions<CacheSettings> settings,
        IConfiguration configuration)
    {
        _cache = cache;
        _redis = redis;
        _logger = logger;
        _settings = settings.Value;
        _instanceName = configuration.GetValue<string>("Redis:InstanceName") ?? "ArenaOps_";
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        try
        {
            var data = await _cache.GetStringAsync(key, ct);
            if (data is null) return default;

            _logger.LogDebug("Cache HIT: {Key}", key);
            return JsonSerializer.Deserialize<T>(data, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache GET failed for key: {Key} — falling through to DB", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        try
        {
            var data = JsonSerializer.Serialize(value, _jsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl ?? TimeSpan.FromMinutes(_settings.DefaultTTLMinutes)
            };

            await _cache.SetStringAsync(key, data, options, ct);
            _logger.LogDebug("Cache SET: {Key} | TTL: {TTL}min", key, (ttl ?? TimeSpan.FromMinutes(_settings.DefaultTTLMinutes)).TotalMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache SET failed for key: {Key} — operation continues without cache", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _cache.RemoveAsync(key, ct);
            _logger.LogDebug("Cache REMOVE: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache REMOVE failed for key: {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var fullPrefix = $"{_instanceName}{prefix}";
            var keys = server.Keys(pattern: $"{fullPrefix}*").ToArray();

            if (keys.Length == 0) return;

            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(keys);

            _logger.LogDebug("Cache REMOVE BY PREFIX: {Prefix} | {Count} keys removed", prefix, keys.Length);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache REMOVE BY PREFIX failed for: {Prefix}", prefix);
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var data = await _cache.GetStringAsync(key, ct);
            return data is not null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache EXISTS check failed for key: {Key}", key);
            return false;
        }
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        var cached = await GetAsync<T>(key, ct);
        if (cached is not null) return cached;

        _logger.LogDebug("Cache MISS: {Key} — loading from source", key);

        var value = await factory();

        if (value is not null)
        {
            await SetAsync(key, value, ttl, ct);
        }

        return value;
    }
}
