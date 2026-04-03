using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class SeatingPlanService : ISeatingPlanService
{
    private readonly ISeatingPlanRepository _repository;

    public SeatingPlanService(ISeatingPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<SeatingPlanDto>> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        if (seatingPlan == null)
            return ApiResponse<SeatingPlanDto>.Fail("NOT_FOUND", "Seating plan not found");

        return ApiResponse<SeatingPlanDto>.Ok(MapToDto(seatingPlan));
    }

    public async Task<ApiResponse<IEnumerable<SeatingPlanDto>>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default)
    {
        var seatingPlans = await _repository.GetByStadiumIdAsync(stadiumId, cancellationToken);
        var dtos = seatingPlans.Select(MapToDto);
        return ApiResponse<IEnumerable<SeatingPlanDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<IEnumerable<SeatingPlanDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var seatingPlans = await _repository.GetAllAsync(cancellationToken);
        var dtos = seatingPlans.Select(MapToDto);
        return ApiResponse<IEnumerable<SeatingPlanDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<SeatingPlanDto>> CreateAsync(CreateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        // Verify stadium exists
        var stadiumExists = await _repository.StadiumExistsAsync(request.StadiumId, cancellationToken);
        if (!stadiumExists)
            return ApiResponse<SeatingPlanDto>.Fail("STADIUM_NOT_FOUND", "Stadium not found");

        // Ensure 1:1 relationship between stadium and seating plan
        var existingPlans = await _repository.GetByStadiumIdAsync(request.StadiumId, cancellationToken);
        var existingPlan = existingPlans.FirstOrDefault();
        if (existingPlan != null)
        {
            return ApiResponse<SeatingPlanDto>.Ok(MapToDto(existingPlan), "Seating plan already exists");
        }

        var seatingPlan = new SeatingPlan
        {
            SeatingPlanId = Guid.NewGuid(),
            StadiumId = request.StadiumId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var created = await _repository.CreateAsync(seatingPlan, cancellationToken);
        return ApiResponse<SeatingPlanDto>.Ok(MapToDto(created), "Seating plan created successfully");
    }

    public async Task<ApiResponse<SeatingPlanDto>> UpdateAsync(Guid seatingPlanId, UpdateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        if (seatingPlan == null)
            return ApiResponse<SeatingPlanDto>.Fail("NOT_FOUND", "Seating plan not found");

        // Update properties
        seatingPlan.Name = request.Name;
        seatingPlan.Description = request.Description;
        if (request.IsActive.HasValue)
        {
            seatingPlan.IsActive = request.IsActive.Value;
        }

        var updated = await _repository.UpdateAsync(seatingPlan, cancellationToken);
        return ApiResponse<SeatingPlanDto>.Ok(MapToDto(updated), "Seating plan updated successfully");
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid seatingPlanId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        if (seatingPlan == null)
            return ApiResponse<object>.Fail("NOT_FOUND", "Seating plan not found");

        var deleted = await _repository.DeleteAsync(seatingPlanId, cancellationToken);
        if (!deleted)
            return ApiResponse<object>.Fail("DELETE_FAILED", "Could not delete seating plan");

        return ApiResponse<object>.Ok(new { }, "Seating plan deleted successfully");
    }

    private static SeatingPlanDto MapToDto(SeatingPlan seatingPlan)
    {
        return new SeatingPlanDto
        {
            SeatingPlanId = seatingPlan.SeatingPlanId,
            StadiumId = seatingPlan.StadiumId,
            Name = seatingPlan.Name,
            Description = seatingPlan.Description,
            FieldConfigMetadata = seatingPlan.FieldConfigMetadata,
            TotalCapacity = seatingPlan.TotalCapacity,
            Sections = seatingPlan.Sections?.Select(s => new SectionDto
            {
                SectionId = s.SectionId,
                SeatingPlanId = s.SeatingPlanId,
                Name = s.Name,
                Type = s.Type,
                Capacity = s.Capacity,
                SeatType = s.SeatType,
                Color = s.Color,
                PosX = s.PosX,
                PosY = s.PosY,
                Rows = s.Rows,
                SeatsPerRow = s.SeatsPerRow,
                GeometryType = s.GeometryType,
                GeometryData = s.GeometryData
            }).ToList() ?? new List<SectionDto>(),
            Landmarks = seatingPlan.Landmarks?.Select(l => new LandmarkDto
            {
                FeatureId = l.FeatureId,
                SeatingPlanId = l.SeatingPlanId,
                Type = l.Type,
                Label = l.Label,
                PosX = l.PosX,
                PosY = l.PosY,
                Width = l.Width,
                Height = l.Height
            }).ToList() ?? new List<LandmarkDto>()
        };
    }
}
