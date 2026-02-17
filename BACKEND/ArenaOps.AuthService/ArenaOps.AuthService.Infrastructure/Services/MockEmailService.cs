using ArenaOps.AuthService.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ArenaOps.AuthService.Infrastructure.Services;

/// <summary>
/// Mock email service that logs credentials to console.
/// Replace with SMTP/SendGrid implementation in production.
/// </summary>
public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendStadiumManagerCredentialsAsync(string email, string fullName, string temporaryPassword)
    {
        _logger.LogInformation(
            "═══════════════════════════════════════════════════════════════\n" +
            "  📧 STADIUM MANAGER CREDENTIALS (Mock Email)\n" +
            "  ───────────────────────────────────────────────────────────\n" +
            "  To:       {Email}\n" +
            "  Name:     {FullName}\n" +
            "  Password: {TempPassword}\n" +
            "  ───────────────────────────────────────────────────────────\n" +
            "  ⚠️  Please change your password after first login.\n" +
            "═══════════════════════════════════════════════════════════════",
            email, fullName, temporaryPassword);

        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        _logger.LogInformation(
            "═══════════════════════════════════════════════════════════════\n" +
            "  📧 PASSWORD RESET (Mock Email)\n" +
            "  ───────────────────────────────────────────────────────────\n" +
            "  To:    {Email}\n" +
            "  Token: {ResetToken}\n" +
            "═══════════════════════════════════════════════════════════════",
            email, resetToken);

        return Task.CompletedTask;
    }
}
