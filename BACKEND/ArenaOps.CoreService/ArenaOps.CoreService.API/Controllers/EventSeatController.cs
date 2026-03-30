using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;
using ArenaOps.Shared.Exceptions;

namespace ArenaOps.CoreService.API.Controllers;

/// <summary>
/// EventSeat APIs — generate, retrieve, and manage seat holds.
///
/// Routes:
///   POST  /api/events/{eventId}/generate-seats           → Generate EventSeats (EventManager/Admin)
///   GET   /api/events/{eventId}/seats                    → List all EventSeats for an event
///   POST  /api/events/{eventId}/seats/{seatId}/hold      → Hold a seat (any authenticated user)
///   POST  /api/events/{eventId}/seats/{seatId}/release   → Release a held seat
///   POST  /api/events/{eventId}/standing/{sectionId}/hold → Hold multiple standing tickets
///
/// AUTHORIZATION:
///   generate-seats → EventManager or Admin only
///   list/hold/release seats → Any authenticated user
/// </summary>
[ApiController]
[Authorize]
public class EventSeatController : ControllerBase
{
    private readonly IEventSeatService _eventSeatService;

    public EventSeatController(IEventSeatService eventSeatService)
    {
        _eventSeatService = eventSeatService;
    }

    /// <summary>
    /// Generate EventSeats for all sections of an event.
    ///
    /// Pre-conditions (enforced by service):
    ///   - Event must have a seating layout.
    ///   - Layout must be locked (IsLocked = true).
    ///   - Seats must NOT have been generated yet (idempotency).
    ///
    /// Returns a summary with total seats generated, per section type counts,
    /// and a per-section breakdown.
    ///
    /// HTTP status codes:
    ///   201 Created        → seats generated successfully
    ///   404 Not Found      → no layout exists for the event
    ///   409 Conflict       → layout not locked, or seats already generated
    /// </summary>
    [HttpPost("api/events/{eventId:guid}/generate-seats")]
    [Authorize(Roles = "EventManager,Admin")]
    public async Task<IActionResult> GenerateSeats(Guid eventId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _eventSeatService.GenerateSeatsForEventAsync(eventId, userId, cancellationToken);

        if (!response.Success)
        {
            return response.Error?.Code switch
            {
                "LAYOUT_NOT_FOUND" => NotFound(response),
                "NO_SECTIONS"      => NotFound(response),
                "LAYOUT_NOT_LOCKED"        => Conflict(response),
                "SEATS_ALREADY_GENERATED"  => Conflict(response),
                _ => BadRequest(response)
            };
        }

        return CreatedAtAction(nameof(GetSeats), new { eventId }, response);
    }

    /// <summary>
    /// Get all EventSeats for an event.
    /// Returns all seats across all sections, ordered by section name then row/seat number.
    /// Any authenticated user can view.
    /// </summary>
    [HttpGet("api/events/{eventId:guid}/seats")]
    public async Task<IActionResult> GetSeats(Guid eventId, CancellationToken cancellationToken)
    {
        var response = await _eventSeatService.GetByEventIdAsync(eventId, cancellationToken);
        return Ok(response);
    }

    // ─── Seat Hold Operations ────────────────────────────────────────────

    /// <summary>
    /// Hold a single seat for the authenticated user.
    /// Hold expires after 10 minutes (600 seconds) by default.
    ///
    /// HTTP status codes:
    ///   200 OK          → seat held successfully
    ///   404 Not Found   → seat doesn't exist
    ///   409 Conflict    → seat is already held by another user
    /// </summary>
    [HttpPost("api/events/{eventId:guid}/seats/{seatId:guid}/hold")]
    public async Task<IActionResult> HoldSeat(Guid eventId, Guid seatId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _eventSeatService.HoldSeatAsync(eventId, seatId, userId, 600, cancellationToken);

        if (!response.Success)
        {
            return response.Error?.Code switch
            {
                "SEAT_NOT_FOUND" => NotFound(response),
                "SEAT_UNAVAILABLE" => Conflict(response),
                _ => BadRequest(response)
            };
        }

        return Ok(response);
    }

    /// <summary>
    /// Release a held seat back to Available status.
    /// Only the user who holds the seat can release it.
    ///
    /// HTTP status codes:
    ///   200 OK          → seat released successfully
    ///   404 Not Found   → seat doesn't exist
    ///   409 Conflict    → seat is not held by this user
    /// </summary>
    [HttpPost("api/events/{eventId:guid}/seats/{seatId:guid}/release")]
    public async Task<IActionResult> ReleaseSeat(Guid eventId, Guid seatId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _eventSeatService.ReleaseSeatAsync(eventId, seatId, userId, cancellationToken);

        if (!response.Success)
        {
            return response.Error?.Code switch
            {
                "SEAT_NOT_FOUND" => NotFound(response),
                "NOT_HELD_BY_USER" => Conflict(response),
                _ => BadRequest(response)
            };
        }

        return Ok(response);
    }

    /// <summary>
    /// Hold multiple standing section tickets for the authenticated user.
    /// Atomically holds up to `quantity` available slots in the section.
    ///
    /// HTTP status codes:
    ///   200 OK          → tickets held successfully
    ///   400 Bad Request → invalid quantity
    ///   404 Not Found   → section doesn't exist or no available seats
    ///   409 Conflict    → not enough available seats
    /// </summary>
    [HttpPost("api/events/{eventId:guid}/standing/{sectionId:guid}/hold")]
    public async Task<IActionResult> HoldStanding(
        Guid eventId, Guid sectionId, [FromBody] HoldStandingRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", "Invalid request data"));

        var userId = GetUserId();
        var response = await _eventSeatService.HoldStandingAsync(
            eventId, sectionId, userId, request.Quantity, 600, cancellationToken);

        if (!response.Success)
        {
            return response.Error?.Code switch
            {
                "INVALID_QUANTITY" => BadRequest(response),
                "SECTION_NOT_FOUND" => NotFound(response),
                "INSUFFICIENT_AVAILABILITY" => Conflict(response),
                "HOLD_FAILED" => Conflict(response),
                _ => BadRequest(response)
            };
        }

        return Ok(response);
    }

    // ─── Helper ──────────────────────────────────────────────────

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
