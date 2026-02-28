using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ArenaOps.CoreService.Infrastructure.Repositories;

public class LandmarkRepository : ILandmarkRepository
{
    private readonly CoreDbContext _context;

    public LandmarkRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<Landmark?> GetByIdAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        return await _context.Landmarks
            .Include(l => l.SeatingPlan)
            .FirstOrDefaultAsync(l => l.FeatureId == featureId, cancellationToken);
    }

    public async Task<IEnumerable<Landmark>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.Landmarks
            .Include(l => l.SeatingPlan)
            .Where(l => l.SeatingPlanId == seatingPlanId)
            .OrderBy(l => l.Type)
            .ThenBy(l => l.Label)
            .ToListAsync(cancellationToken);
    }

    public async Task<Landmark> CreateAsync(Landmark landmark, CancellationToken cancellationToken = default)
    {
        _context.Landmarks.Add(landmark);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        return (await GetByIdAsync(landmark.FeatureId, cancellationToken))!;
    }

    public async Task<Landmark> UpdateAsync(Landmark landmark, CancellationToken cancellationToken = default)
    {
        _context.Landmarks.Update(landmark);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        return (await GetByIdAsync(landmark.FeatureId, cancellationToken))!;
    }

    public async Task<bool> DeleteAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        var landmark = await _context.Landmarks.FindAsync(new object[] { featureId }, cancellationToken);
        if (landmark == null)
            return false;

        _context.Landmarks.Remove(landmark);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ExistsAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        return await _context.Landmarks.AnyAsync(l => l.FeatureId == featureId, cancellationToken);
    }

    public async Task<bool> SeatingPlanExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans.AnyAsync(sp => sp.SeatingPlanId == seatingPlanId, cancellationToken);
    }
}
