using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface ISectionService
{
    Task<ApiResponse<SectionResponse>> GetByIdAsync(Guid sectionId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SectionResponse>>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<SectionResponse>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<SectionResponse>> CreateAsync(CreateSectionRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<SectionResponse>> UpdateAsync(Guid sectionId, UpdateSectionRequest request, Guid ownerId, CancellationToken cancellationToken = default);
    Task<ApiResponse<object>> DeleteAsync(Guid sectionId, Guid ownerId, CancellationToken cancellationToken = default);
}
