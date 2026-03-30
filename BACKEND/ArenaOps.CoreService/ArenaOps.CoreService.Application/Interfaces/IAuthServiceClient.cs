namespace ArenaOps.CoreService.Application.Interfaces;

using ArenaOps.CoreService.Application.DTOs;

public interface IAuthServiceClient
{
    Task<UserStatsDto> GetUserStatsAsync(CancellationToken cancellationToken = default);
}

public class UserStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
    public int NewUsersToday { get; set; }
    public int NewUsersThisWeek { get; set; }
    public int NewUsersThisMonth { get; set; }
    public UsersByRoleDto UsersByRole { get; set; } = new();
}
