using System.ComponentModel.DataAnnotations;

namespace ArenaOps.AuthService.Core.DTOs;

public class RefreshRequest
{
    [Required(ErrorMessage = "Refresh token is required.")]
    public string RefreshToken { get; set; } = string.Empty;
}
