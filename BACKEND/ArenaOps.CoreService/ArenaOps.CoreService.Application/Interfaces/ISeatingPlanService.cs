using ArenaOps.CoreService.Application.DTOs;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISeatingPlanService
{
    Task<SeatingPlanResponse?> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeatingPlanResponse>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeatingPlanResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SeatingPlanResponse> CreateAsync(CreateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<SeatingPlanResponse> UpdateAsync(Guid seatingPlanId, UpdateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid seatingPlanId, Guid ownerId, CancellationToken cancellationToken = default);
}
