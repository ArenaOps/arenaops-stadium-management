using ArenaOps.CoreService.Domain.Entities;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISeatingPlanRepository
{
    Task<SeatingPlan?> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeatingPlan>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeatingPlan>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SeatingPlan> CreateAsync(SeatingPlan seatingPlan, CancellationToken cancellationToken = default);
    Task<SeatingPlan> UpdateAsync(SeatingPlan seatingPlan, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<bool> StadiumExistsAsync(Guid stadiumId, CancellationToken cancellationToken = default);
}
