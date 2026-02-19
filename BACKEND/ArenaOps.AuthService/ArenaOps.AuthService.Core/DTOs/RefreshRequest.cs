using System.ComponentModel.DataAnnotations;

namespace ArenaOps.AuthService.Core.DTOs;

public class RefreshRequest
{
    // Optional in request body — can also come from the refreshToken cookie.
    public string? RefreshToken { get; set; }
}
