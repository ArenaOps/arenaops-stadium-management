using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface IAdminService
{
    Task<ApiResponse<IEnumerable<StadiumDto>>> GetPendingStadiumsAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<StadiumDto>> ApproveStadiumAsync(Guid stadiumId, CancellationToken cancellationToken = default);
}
