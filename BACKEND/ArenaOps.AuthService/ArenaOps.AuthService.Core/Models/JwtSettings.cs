namespace ArenaOps.AuthService.Core.Models;

public class JwtSettings
{
    public string Issuer { get; set; } = "ArenaOps";
    public string Audience { get; set; } = "ArenaOps";
    public int AccessTokenExpiryMinutes { get; set; } = 30;
    public int RefreshTokenExpiryDays { get; set; } = 7;
    public string KeyFilePath { get; set; } = "Keys/rsa-private.key";
}
