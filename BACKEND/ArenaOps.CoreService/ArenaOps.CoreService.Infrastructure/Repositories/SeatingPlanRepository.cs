using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ArenaOps.CoreService.Infrastructure.Repositories;

public class SeatingPlanRepository : ISeatingPlanRepository
{
    private readonly CoreDbContext _context;

    public SeatingPlanRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<SeatingPlan?> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans
            .Include(sp => sp.Stadium)
            .Include(sp => sp.Sections)
            .Include(sp => sp.Landmarks)
            .FirstOrDefaultAsync(sp => sp.SeatingPlanId == seatingPlanId, cancellationToken);
    }

    public async Task<IEnumerable<SeatingPlan>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans
            .Include(sp => sp.Stadium)
            .Include(sp => sp.Sections)
            .Include(sp => sp.Landmarks)
            .Where(sp => sp.StadiumId == stadiumId)
            .OrderByDescending(sp => sp.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SeatingPlan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans
            .Include(sp => sp.Stadium)
            .Include(sp => sp.Sections)
            .Include(sp => sp.Landmarks)
            .OrderByDescending(sp => sp.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<SeatingPlan> CreateAsync(SeatingPlan seatingPlan, CancellationToken cancellationToken = default)
    {
        _context.SeatingPlans.Add(seatingPlan);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Reload with navigation properties
        return (await GetByIdAsync(seatingPlan.SeatingPlanId, cancellationToken))!;
    }

    public async Task<SeatingPlan> UpdateAsync(SeatingPlan seatingPlan, CancellationToken cancellationToken = default)
    {
        _context.SeatingPlans.Update(seatingPlan);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Reload with navigation properties
        return (await GetByIdAsync(seatingPlan.SeatingPlanId, cancellationToken))!;
    }

    public async Task<bool> DeleteAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _context.SeatingPlans.FindAsync(new object[] { seatingPlanId }, cancellationToken);
        if (seatingPlan == null)
            return false;

        _context.SeatingPlans.Remove(seatingPlan);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans.AnyAsync(sp => sp.SeatingPlanId == seatingPlanId, cancellationToken);
    }

    public async Task<bool> StadiumExistsAsync(Guid stadiumId, CancellationToken cancellationToken = default)
    {
        return await _context.Stadiums.AnyAsync(s => s.StadiumId == stadiumId, cancellationToken);
    }
}
