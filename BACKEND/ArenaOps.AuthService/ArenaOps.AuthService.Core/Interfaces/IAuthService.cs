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

    /// <summary>
    /// Generates a 6-digit OTP, hashes it, and sends it to the user's email.
    /// Always succeeds (even if email not found) to prevent email enumeration.
    /// </summary>
    Task ForgotPasswordAsync(string email);

    /// <summary>
    /// Verifies the OTP and resets the user's password.
    /// </summary>
    Task ResetPasswordAsync(ResetPasswordRequest request, string? ipAddress, string? userAgent);

    /// <summary>
    /// Changes password for an authenticated user (requires current password).
    /// </summary>
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, string? ipAddress, string? userAgent);
}
