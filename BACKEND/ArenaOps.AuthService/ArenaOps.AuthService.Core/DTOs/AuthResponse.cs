namespace ArenaOps.AuthService.Core.DTOs;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string[] Roles { get; set; } = Array.Empty<string>();
    public bool IsNewUser { get; set; }
}
