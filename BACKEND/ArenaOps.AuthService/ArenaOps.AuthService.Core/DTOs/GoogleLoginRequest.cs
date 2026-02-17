using System.ComponentModel.DataAnnotations;

namespace ArenaOps.AuthService.Core.DTOs;

public class GoogleLoginRequest
{
    [Required(ErrorMessage = "Authorization code is required.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Redirect URI is required.")]
    [Url(ErrorMessage = "Invalid redirect URI format.")]
    public string RedirectUri { get; set; } = string.Empty;
}
