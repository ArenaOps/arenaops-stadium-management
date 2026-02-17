namespace ArenaOps.AuthService.Core.Interfaces;

/// <summary>
/// Email service interface for sending notification emails.
/// Current implementation: Mock (logs to console).
/// Future: Replace with SMTP/SendGrid/etc.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends Stadium Manager credentials (email + temporary password).
    /// </summary>
    Task SendStadiumManagerCredentialsAsync(string email, string fullName, string temporaryPassword);

    /// <summary>
    /// Sends a password reset link/token.
    /// </summary>
    Task SendPasswordResetEmailAsync(string email, string resetToken);
}
