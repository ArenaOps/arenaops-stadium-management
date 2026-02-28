using ArenaOps.CoreService.Domain.Entities;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISeatRepository
{
    Task<Seat?> GetByIdAsync(Guid seatId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Seat>> GetBySectionIdAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<Seat> CreateAsync(Seat seat, CancellationToken cancellationToken = default);
    Task<IEnumerable<Seat>> CreateBulkAsync(IEnumerable<Seat> seats, CancellationToken cancellationToken = default);
    Task<Seat> UpdateAsync(Seat seat, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid seatId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid seatId, CancellationToken cancellationToken = default);
    Task<bool> SectionExistsAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<Section?> GetSectionWithPlanAsync(Guid sectionId, CancellationToken cancellationToken = default);
}
