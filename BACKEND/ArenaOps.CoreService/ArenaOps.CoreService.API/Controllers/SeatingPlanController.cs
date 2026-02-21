using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.Shared.Models;
using ArenaOps.Shared.Exceptions;

namespace ArenaOps.CoreService.API.Controllers;

[ApiController]
[Route("api/seating-plans")]
[Authorize]
public class SeatingPlanController : ControllerBase
{
    private readonly ISeatingPlanService _seatingPlanService;

    public SeatingPlanController(ISeatingPlanService seatingPlanService)
    {
        _seatingPlanService = seatingPlanService;
    }

    /// <summary>
    /// Get all seating plans
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var seatingPlans = await _seatingPlanService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<SeatingPlanResponse>>.Ok(seatingPlans, "Seating plans retrieved successfully"));
    }

    /// <summary>
    /// Get seating plan by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var seatingPlan = await _seatingPlanService.GetByIdAsync(id, cancellationToken);
        if (seatingPlan == null)
        {
            throw new NotFoundException("SEATING_PLAN_NOT_FOUND", "Seating plan not found");
        }

        return Ok(ApiResponse<SeatingPlanResponse>.Ok(seatingPlan, "Seating plan retrieved successfully"));
    }

    /// <summary>
    /// Get seating plans by stadium ID
    /// </summary>
    [HttpGet("stadium/{stadiumId:guid}")]
    public async Task<IActionResult> GetByStadiumId(Guid stadiumId, CancellationToken cancellationToken)
    {
        var seatingPlans = await _seatingPlanService.GetByStadiumIdAsync(stadiumId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<SeatingPlanResponse>>.Ok(seatingPlans, "Seating plans retrieved successfully"));
    }

    /// <summary>
    /// Create a new seating plan (Stadium Owner only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSeatingPlanRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            throw new BadRequestException("VALIDATION_ERROR", "Invalid request data");
        }

        var userId = GetUserId();
        var seatingPlan = await _seatingPlanService.CreateAsync(request, userId, cancellationToken);
        
        return CreatedAtAction(
            nameof(GetById), 
            new { id = seatingPlan.SeatingPlanId }, 
            ApiResponse<SeatingPlanResponse>.Ok(seatingPlan, "Seating plan created successfully")
        );
    }

    /// <summary>
    /// Update an existing seating plan (Stadium Owner only)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSeatingPlanRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            throw new BadRequestException("VALIDATION_ERROR", "Invalid request data");
        }

        var userId = GetUserId();
        var seatingPlan = await _seatingPlanService.UpdateAsync(id, request, userId, cancellationToken);
        
        return Ok(ApiResponse<SeatingPlanResponse>.Ok(seatingPlan, "Seating plan updated successfully"));
    }

    /// <summary>
    /// Delete a seating plan (Stadium Owner only)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "StadiumOwner,Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _seatingPlanService.DeleteAsync(id, userId, cancellationToken);
        
        return Ok(ApiResponse<object>.Ok(new { }, "Seating plan deleted successfully"));
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
