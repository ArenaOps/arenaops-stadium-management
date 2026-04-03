using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISeatingPlanService
{
    Task<ApiResponse<SeatingPlanDto>> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SeatingPlanDto>>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SeatingPlanDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<SeatingPlanDto>> CreateAsync(CreateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<SeatingPlanDto>> UpdateAsync(Guid seatingPlanId, UpdateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<object>> DeleteAsync(Guid seatingPlanId, Guid ownerId, CancellationToken cancellationToken = default);
}
