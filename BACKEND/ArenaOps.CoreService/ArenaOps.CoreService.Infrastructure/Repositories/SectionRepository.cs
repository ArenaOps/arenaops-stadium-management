using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ArenaOps.CoreService.Infrastructure.Repositories;

public class SectionRepository : ISectionRepository
{
    private readonly CoreDbContext _context;

    public SectionRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<Section?> GetByIdAsync(Guid sectionId, CancellationToken cancellationToken = default)
    {
        return await _context.Sections
            .Include(s => s.SeatingPlan)
            .Include(s => s.Seats)
            .FirstOrDefaultAsync(s => s.SectionId == sectionId, cancellationToken);
    }

    public async Task<IEnumerable<Section>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.Sections
            .Include(s => s.SeatingPlan)
            .Include(s => s.Seats)
            .Where(s => s.SeatingPlanId == seatingPlanId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Section>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Sections
            .Include(s => s.SeatingPlan)
            .Include(s => s.Seats)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Section> CreateAsync(Section section, CancellationToken cancellationToken = default)
    {
        _context.Sections.Add(section);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        return (await GetByIdAsync(section.SectionId, cancellationToken))!;
    }

    public async Task<Section> UpdateAsync(Section section, CancellationToken cancellationToken = default)
    {
        _context.Sections.Update(section);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        return (await GetByIdAsync(section.SectionId, cancellationToken))!;
    }

    public async Task<bool> DeleteAsync(Guid sectionId, CancellationToken cancellationToken = default)
    {
        var section = await _context.Sections.FindAsync(new object[] { sectionId }, cancellationToken);
        if (section == null)
            return false;

        _context.Sections.Remove(section);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ExistsAsync(Guid sectionId, CancellationToken cancellationToken = default)
    {
        return await _context.Sections.AnyAsync(s => s.SectionId == sectionId, cancellationToken);
    }

    public async Task<bool> SeatingPlanExistsAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.SeatingPlans.AnyAsync(sp => sp.SeatingPlanId == seatingPlanId, cancellationToken);
    }
}
