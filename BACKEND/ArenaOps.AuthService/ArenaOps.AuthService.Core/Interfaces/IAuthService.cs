using ArenaOps.AuthService.Core.DTOs;

namespace ArenaOps.AuthService.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, string? userAgent);
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);

    /// <summary>
    /// Admin-only: Creates a Stadium Manager account with a temporary password.
    /// Sends credentials via IEmailService.
    /// </summary>
    Task<CreateStadiumManagerResponse> CreateStadiumManagerAsync(CreateStadiumManagerRequest request, string? ipAddress, string? userAgent);
}
