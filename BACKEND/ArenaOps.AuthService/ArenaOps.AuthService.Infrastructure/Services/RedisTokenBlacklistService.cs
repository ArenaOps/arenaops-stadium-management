using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.Shared.Interfaces;

namespace ArenaOps.AuthService.Infrastructure.Services;

public class RedisTokenBlacklistService : ITokenBlacklistService
{
    private readonly ICacheService _cache;
    private const string BlacklistPrefix = "auth:blacklist:";

    public RedisTokenBlacklistService(ICacheService cache)
    {
        _cache = cache;
    }

    public async Task BlacklistTokenAsync(string jti, DateTime expiresAt)
    {
        var ttl = expiresAt - DateTime.UtcNow;
        if (ttl <= TimeSpan.Zero) return;

        await _cache.SetAsync($"{BlacklistPrefix}{jti}", true, ttl);
    }

    public async Task<bool> IsBlacklistedAsync(string jti)
    {
        return await _cache.ExistsAsync($"{BlacklistPrefix}{jti}");
    }
}
