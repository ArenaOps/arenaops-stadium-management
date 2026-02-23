using ArenaOps.CoreService.Domain.Entities;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISectionRepository
{
    Task<Section?> GetByIdAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Section>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Section>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Section> CreateAsync(Section section, CancellationToken cancellationToken = default);
    Task<Section> UpdateAsync(Section section, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<bool> SeatingPlanExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
}
