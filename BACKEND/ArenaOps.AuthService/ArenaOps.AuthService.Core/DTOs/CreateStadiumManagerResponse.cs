namespace ArenaOps.AuthService.Core.DTOs;

/// <summary>
/// Response returned after successfully creating a Stadium Manager account.
/// </summary>
public class CreateStadiumManagerResponse
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "StadiumOwner";
    public string Message { get; set; } = string.Empty;
}
