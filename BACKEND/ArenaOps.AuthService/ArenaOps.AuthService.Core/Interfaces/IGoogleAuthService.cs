using ArenaOps.AuthService.Core.DTOs;

namespace ArenaOps.AuthService.Core.Interfaces;

public interface IGoogleAuthService
{
    Task<AuthResponse> GoogleLoginAsync(GoogleLoginRequest request, string? ipAddress, string? userAgent);
}
