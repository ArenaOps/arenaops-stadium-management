using System.ComponentModel.DataAnnotations;

namespace ArenaOps.AuthService.Core.DTOs;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
