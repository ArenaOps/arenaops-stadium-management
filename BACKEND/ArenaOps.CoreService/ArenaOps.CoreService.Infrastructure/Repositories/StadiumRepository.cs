using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ArenaOps.CoreService.Infrastructure.Repositories;

public class StadiumRepository : IStadiumRepository
{
    private readonly CoreDbContext _context;

    public StadiumRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Stadium>> GetAllAsync()
    {
        return await _context.Stadiums.AsNoTracking().ToListAsync();
    }

    public async Task<Stadium?> GetByIdAsync(Guid id)
    {
        return await _context.Stadiums.FirstOrDefaultAsync(s => s.StadiumId == id);
    }

    public async Task<IEnumerable<Stadium>> GetByOwnerAsync(Guid ownerId)
    {
        return await _context.Stadiums.AsNoTracking()
            .Where(s => s.OwnerId == ownerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Stadium>> GetPendingApprovalAsync()
    {
        return await _context.Stadiums.AsNoTracking()
            .Where(s => !s.IsApproved)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Stadium stadium)
    {
        await _context.Stadiums.AddAsync(stadium);
    }

    public async Task UpdateAsync(Stadium stadium)
    {
        _context.Stadiums.Update(stadium);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Stadium stadium)
    {
        _context.Stadiums.Remove(stadium);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
