using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class LandmarkService : ILandmarkService
{
    private readonly ILandmarkRepository _repository;

    public LandmarkService(ILandmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<LandmarkResponse>> GetByIdAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        var landmark = await _repository.GetByIdAsync(featureId, cancellationToken);
        if (landmark == null)
            return ApiResponse<LandmarkResponse>.Fail("NOT_FOUND", "Landmark not found");

        return ApiResponse<LandmarkResponse>.Ok(MapToResponse(landmark));
    }

    public async Task<ApiResponse<IEnumerable<LandmarkResponse>>> GetBySeatingPlanIdAsync(Guid seatingPlanId, CancellationToken cancellationToken = default)
    {
        // Verify seating plan exists
        var seatingPlanExists = await _repository.SeatingPlanExistsAsync(seatingPlanId, cancellationToken);
        if (!seatingPlanExists)
            return ApiResponse<IEnumerable<LandmarkResponse>>.Fail("SEATING_PLAN_NOT_FOUND", "Seating plan not found");

        var landmarks = await _repository.GetBySeatingPlanIdAsync(seatingPlanId, cancellationToken);
        var dtos = landmarks.Select(MapToResponse);
        return ApiResponse<IEnumerable<LandmarkResponse>>.Ok(dtos);
    }

    public async Task<ApiResponse<LandmarkResponse>> CreateAsync(CreateLandmarkRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        // Verify seating plan exists
        var seatingPlanExists = await _repository.SeatingPlanExistsAsync(request.SeatingPlanId, cancellationToken);
        if (!seatingPlanExists)
            return ApiResponse<LandmarkResponse>.Fail("SEATING_PLAN_NOT_FOUND", "Seating plan not found");

        var landmark = new Landmark
        {
            FeatureId = Guid.NewGuid(),
            SeatingPlanId = request.SeatingPlanId,
            Type = request.Type,
            Label = request.Label,
            PosX = request.PosX,
            PosY = request.PosY,
            Width = request.Width,
            Height = request.Height
        };

        var created = await _repository.CreateAsync(landmark, cancellationToken);
        return ApiResponse<LandmarkResponse>.Ok(MapToResponse(created), "Landmark created successfully");
    }

    public async Task<ApiResponse<LandmarkResponse>> UpdateAsync(Guid featureId, UpdateLandmarkRequest request, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var landmark = await _repository.GetByIdAsync(featureId, cancellationToken);
        if (landmark == null)
            return ApiResponse<LandmarkResponse>.Fail("NOT_FOUND", "Landmark not found");

        // Update properties
        landmark.Type = request.Type;
        landmark.Label = request.Label;
        landmark.PosX = request.PosX;
        landmark.PosY = request.PosY;
        landmark.Width = request.Width;
        landmark.Height = request.Height;

        var updated = await _repository.UpdateAsync(landmark, cancellationToken);
        return ApiResponse<LandmarkResponse>.Ok(MapToResponse(updated), "Landmark updated successfully");
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid featureId, Guid ownerId, CancellationToken cancellationToken = default)
    {
        var landmark = await _repository.GetByIdAsync(featureId, cancellationToken);
        if (landmark == null)
            return ApiResponse<object>.Fail("NOT_FOUND", "Landmark not found");

        var deleted = await _repository.DeleteAsync(featureId, cancellationToken);
        if (!deleted)
            return ApiResponse<object>.Fail("DELETE_FAILED", "Could not delete landmark");

        return ApiResponse<object>.Ok(new { }, "Landmark deleted successfully");
    }

    private static LandmarkResponse MapToResponse(Landmark landmark)
    {
        return new LandmarkResponse
        {
            FeatureId = landmark.FeatureId,
            SeatingPlanId = landmark.SeatingPlanId,
            SeatingPlanName = landmark.SeatingPlan?.Name ?? string.Empty,
            Type = landmark.Type,
            Label = landmark.Label,
            PosX = landmark.PosX,
            PosY = landmark.PosY,
            Width = landmark.Width,
            Height = landmark.Height
        };
    }
}
