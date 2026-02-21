using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISeatingPlanService
{
    Task<ApiResponse<SeatingPlanResponse>> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SeatingPlanResponse>>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SeatingPlanResponse>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<SeatingPlanResponse>> CreateAsync(CreateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<SeatingPlanResponse>> UpdateAsync(Guid seatingPlanId, UpdateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<object>> DeleteAsync(Guid seatingPlanId, Guid ownerId, CancellationToken cancellationToken = default);
}
