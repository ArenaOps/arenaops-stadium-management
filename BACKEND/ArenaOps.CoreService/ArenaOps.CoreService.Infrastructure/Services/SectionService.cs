using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class SectionService : ISectionService
{
    private readonly ISectionRepository _repository;

    public SectionService(ISectionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<SectionResponse>> GetByIdAsync(Guid sectionId, CancellationToken cancellationToken = default)
    {
        var section = await _repository.GetByIdAsync(sectionId, cancellationToken);
        if (section == null)
            return ApiResponse<SectionResponse>.Fail("NOT_FOUND", "Section not found");

        return ApiResponse<SectionResponse>.Ok(MapToResponse(section));
    }

    public async Task<ApiResponse<IEnumerable<SectionResponse>>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        var sections = await _repository.GetBySeatingPlanIdAsync(seatingPlanId, cancellationToken);
        var dtos = sections.Select(MapToResponse);
        return ApiResponse<IEnumerable<SectionResponse>>.Ok(dtos);
    }

    public async Task<ApiResponse<IEnumerable<SectionResponse>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var sections = await _repository.GetAllAsync(cancellationToken);
        var dtos = sections.Select(MapToResponse);
        return ApiResponse<IEnumerable<SectionResponse>>.Ok(dtos);
    }

    public async Task<ApiResponse<SectionResponse>> CreateAsync(CreateSectionRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        // Verify seating plan exists
        var seatingPlanExists = await _repository.SeatingPlanExistsAsync(request.SeatingPlanId, cancellationToken);
        if (!seatingPlanExists)
            return ApiResponse<SectionResponse>.Fail("SEATING_PLAN_NOT_FOUND", "Seating plan not found");

        var section = new Section
        {
            SectionId = Guid.NewGuid(),
            SeatingPlanId = request.SeatingPlanId,
            Name = request.Name,
            Type = request.Type,
            Capacity = request.Capacity,
            SeatType = request.SeatType,
            Color = request.Color,
            PosX = request.PosX,
            PosY = request.PosY
        };

        var created = await _repository.CreateAsync(section, cancellationToken);
        return ApiResponse<SectionResponse>.Ok(MapToResponse(created), "Section created successfully");
    }

    public async Task<ApiResponse<SectionResponse>> UpdateAsync(Guid sectionId, UpdateSectionRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var section = await _repository.GetByIdAsync(sectionId, cancellationToken);
        if (section == null)
            return ApiResponse<SectionResponse>.Fail("NOT_FOUND", "Section not found");

        // Update properties
        section.Name = request.Name;
        section.Type = request.Type;
        section.Capacity = request.Capacity;
        section.SeatType = request.SeatType;
        section.Color = request.Color;
        section.PosX = request.PosX;
        section.PosY = request.PosY;

        var updated = await _repository.UpdateAsync(section, cancellationToken);
        return ApiResponse<SectionResponse>.Ok(MapToResponse(updated), "Section updated successfully");
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid sectionId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var section = await _repository.GetByIdAsync(sectionId, cancellationToken);
        if (section == null)
            return ApiResponse<object>.Fail("NOT_FOUND", "Section not found");

        var deleted = await _repository.DeleteAsync(sectionId, cancellationToken);
        if (!deleted)
            return ApiResponse<object>.Fail("DELETE_FAILED", "Could not delete section");

        return ApiResponse<object>.Ok(new { }, "Section deleted successfully");
    }

    private static SectionResponse MapToResponse(Section section)
    {
        return new SectionResponse
        {
            SectionId = section.SectionId,
            SeatingPlanId = section.SeatingPlanId,
            SeatingPlanName = section.SeatingPlan?.Name ?? string.Empty,
            Name = section.Name,
            Type = section.Type,
            Capacity = section.Capacity,
            SeatType = section.SeatType,
            Color = section.Color,
            PosX = section.PosX,
            PosY = section.PosY,
            SeatCount = section.Seats?.Count ?? 0
        };
    }
}
