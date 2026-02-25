using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.Shared.Models;
using ArenaOps.Shared.Exceptions;

namespace ArenaOps.CoreService.API.Controllers;

/// <summary>
/// Landmark CRUD APIs — Template landmarks (stage, gate, exit) under a seating plan.
/// 
/// Routes per API docs (04-Api-Documentation.md):
///   POST   /api/seating-plans/{seatingPlanId}/landmarks   → Add landmark
///   GET    /api/seating-plans/{seatingPlanId}/landmarks    → List landmarks
///   PUT    /api/landmarks/{id}                             → Update landmark position
///   DELETE /api/landmarks/{id}                             → Remove landmark
/// </summary>
[ApiController]
[Authorize]
public class LandmarkController : ControllerBase
{
    private readonly ILandmarkService _landmarkService;

    public LandmarkController(ILandmarkService landmarkService)
    {
        _landmarkService = landmarkService;
    }

    /// <summary>
    /// List landmarks for a seating plan
    /// </summary>
    [HttpGet("api/seating-plans/{seatingPlanId:guid}/landmarks")]
    public async Task<IActionResult> GetBySeatingPlanId(Guid seatingPlanId, CancellationToken cancellationToken)
    {
        var response = await _landmarkService.GetBySeatingPlanIdAsync(seatingPlanId, cancellationToken);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    /// <summary>
    /// Add landmark to a seating plan (stage, gate, exit, restroom, etc.)
    /// </summary>
    [HttpPost("api/seating-plans/{seatingPlanId:guid}/landmarks")]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Create(Guid seatingPlanId, [FromBody] CreateLandmarkRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", "Invalid request data"));
        }

        // Ensure the route seatingPlanId matches the body seatingPlanId
        request.SeatingPlanId = seatingPlanId;

        var userId = GetUserId();
        var response = await _landmarkService.CreateAsync(request, userId, cancellationToken);

        if (!response.Success)
            return NotFound(response);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Data?.FeatureId },
            response
        );
    }

    /// <summary>
    /// Get landmark by ID
    /// </summary>
    [HttpGet("api/landmarks/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _landmarkService.GetByIdAsync(id, cancellationToken);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    /// <summary>
    /// Update landmark position and properties
    /// </summary>
    [HttpPut("api/landmarks/{id:guid}")]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLandmarkRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", "Invalid request data"));
        }

        var userId = GetUserId();
        var response = await _landmarkService.UpdateAsync(id, request, userId, cancellationToken);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    /// <summary>
    /// Remove landmark
    /// </summary>
    [HttpDelete("api/landmarks/{id:guid}")]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _landmarkService.DeleteAsync(id, userId, cancellationToken);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst("sub")
            ?? User.FindFirst("userId")
            ?? User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedException("UNAUTHORIZED", "User ID not found in token");
        }

        return userId;
    }
}
