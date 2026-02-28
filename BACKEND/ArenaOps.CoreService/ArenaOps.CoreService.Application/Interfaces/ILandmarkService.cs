using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ILandmarkService
{
    Task<ApiResponse<LandmarkResponse>> GetByIdAsync(Guid featureId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<LandmarkResponse>>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<ApiResponse<LandmarkResponse>> CreateAsync(CreateLandmarkRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<LandmarkResponse>> UpdateAsync(Guid featureId, UpdateLandmarkRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<object>> DeleteAsync(Guid featureId, Guid ownerId, CancellationToken cancellationToken = default);
}
