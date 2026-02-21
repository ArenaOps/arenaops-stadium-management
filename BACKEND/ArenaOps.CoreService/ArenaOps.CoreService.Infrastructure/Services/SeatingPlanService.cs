using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Exceptions;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class SeatingPlanService : ISeatingPlanService
{
    private readonly ISeatingPlanRepository _repository;

    public SeatingPlanService(ISeatingPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<SeatingPlanResponse?> GetByIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        return seatingPlan == null ? null : MapToResponse(seatingPlan);
    }

    public async Task<IEnumerable<SeatingPlanResponse>> GetByStadiumIdAsync(Guid stadiumId, CancellationToken cancellationToken = default)
    {
        var seatingPlans = await _repository.GetByStadiumIdAsync(stadiumId, cancellationToken);
        return seatingPlans.Select(MapToResponse);
    }

    public async Task<IEnumerable<SeatingPlanResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var seatingPlans = await _repository.GetAllAsync(cancellationToken);
        return seatingPlans.Select(MapToResponse);
    }

    public async Task<SeatingPlanResponse> CreateAsync(CreateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        // Verify stadium exists
        var stadiumExists = await _repository.StadiumExistsAsync(request.StadiumId, cancellationToken);
        if (!stadiumExists)
        {
            throw new NotFoundException("STADIUM_NOT_FOUND", "Stadium not found");
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
        return MapToResponse(created);
    }

    public async Task<SeatingPlanResponse> UpdateAsync(Guid seatingPlanId, UpdateSeatingPlanRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        if (seatingPlan == null)
        {
            throw new NotFoundException("SEATING_PLAN_NOT_FOUND", "Seating plan not found");
        }

        // Update properties
        seatingPlan.Name = request.Name;
        seatingPlan.Description = request.Description;
        if (request.IsActive.HasValue)
        {
            seatingPlan.IsActive = request.IsActive.Value;
        }

        var updated = await _repository.UpdateAsync(seatingPlan, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<bool> DeleteAsync(Guid seatingPlanId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var seatingPlan = await _repository.GetByIdAsync(seatingPlanId, cancellationToken);
        if (seatingPlan == null)
        {
            throw new NotFoundException("SEATING_PLAN_NOT_FOUND", "Seating plan not found");
        }

        return await _repository.DeleteAsync(seatingPlanId, cancellationToken);
    }

    private static SeatingPlanResponse MapToResponse(SeatingPlan seatingPlan)
    {
        return new SeatingPlanResponse
        {
            SeatingPlanId = seatingPlan.SeatingPlanId,
            StadiumId = seatingPlan.StadiumId,
            StadiumName = seatingPlan.Stadium?.Name ?? string.Empty,
            Name = seatingPlan.Name,
            Description = seatingPlan.Description,
            CreatedAt = seatingPlan.CreatedAt,
            IsActive = seatingPlan.IsActive,
            SectionCount = seatingPlan.Sections?.Count ?? 0,
            LandmarkCount = seatingPlan.Landmarks?.Count ?? 0
        };
    }
}
