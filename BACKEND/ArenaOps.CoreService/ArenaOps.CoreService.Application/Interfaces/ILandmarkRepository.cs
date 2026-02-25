using ArenaOps.CoreService.Domain.Entities;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ILandmarkRepository
{
    Task<Landmark?> GetByIdAsync(Guid featureId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Landmark>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<Landmark> CreateAsync(Landmark landmark, CancellationToken cancellationToken = default);
    Task<Landmark> UpdateAsync(Landmark landmark, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid featureId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid featureId, CancellationToken cancellationToken = default);
    Task<bool> SeatingPlanExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
}
