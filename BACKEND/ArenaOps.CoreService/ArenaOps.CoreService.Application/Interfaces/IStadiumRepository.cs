using ArenaOps.CoreService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface IStadiumRepository
{
    Task<IEnumerable<Stadium>> GetAllAsync();
    Task<Stadium?> GetByIdAsync(Guid id);
    Task<IEnumerable<Stadium>> GetByOwnerAsync(Guid ownerId);
    Task AddAsync(Stadium stadium);
    Task UpdateAsync(Stadium stadium);
    Task DeleteAsync(Stadium stadium);
    Task SaveChangesAsync();
}
