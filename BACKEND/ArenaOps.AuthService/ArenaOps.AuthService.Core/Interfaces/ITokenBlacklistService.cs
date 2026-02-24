namespace ArenaOps.AuthService.Core.Interfaces;

/// <summary>
/// Service to blacklist JWT access tokens after logout.
/// Tokens are stored by their JTI (unique ID) until they naturally expire.
/// This ensures immediate invalidation on logout.
/// </summary>
public interface ITokenBlacklistService
{
    /// <summary>
    /// Adds a token's JTI to the blacklist until it expires.
    /// </summary>
    Task BlacklistTokenAsync(string jti, DateTime expiresAt);

    /// <summary>
    /// Checks if a token's JTI has been blacklisted.
    /// </summary>
    Task<bool> IsBlacklistedAsync(string jti);
}
