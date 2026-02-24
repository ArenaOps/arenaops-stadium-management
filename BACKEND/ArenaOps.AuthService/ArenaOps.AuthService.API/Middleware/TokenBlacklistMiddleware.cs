using System.IdentityModel.Tokens.Jwt;
using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.Shared.Models;
using ArenaOps.AuthService.Core.Models;

namespace ArenaOps.AuthService.API.Middleware;

/// <summary>
/// Middleware that checks every authenticated request against the token blacklist.
/// If the JWT's JTI is blacklisted (user logged out), returns 401 immediately.
/// 
/// Pipeline position: after UseAuthentication(), before UseAuthorization().
/// </summary>
public class TokenBlacklistMiddleware
{
    private readonly RequestDelegate _next;

    public TokenBlacklistMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITokenBlacklistService blacklistService)
    {
        // Only check authenticated requests with a Bearer token
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var jti = context.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

            if (!string.IsNullOrEmpty(jti) && await blacklistService.IsBlacklistedAsync(jti))
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(
                    ApiResponse<object>.Fail("TOKEN_REVOKED", "This token has been revoked. Please login again."));
                return;
            }
        }

        await _next(context);
    }
}
