using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

/// <summary>
/// Service interface for EventSeat operations.
///
/// GenerateSeatsForEventAsync is the core method — called once per event after the layout
/// is locked. It clones Seated section template seats and generates Standing capacity slots.
/// </summary>
public interface IEventSeatService
{
    /// <summary>
    /// Generate EventSeats for all sections of an event.
    ///
    /// Pre-conditions:
    ///   - Event layout must exist for the event.
    ///   - Layout must be locked (IsLocked = true).
    ///   - No EventSeats may already exist for this event (idempotency guard).
    ///
    /// Generation rules:
    ///   Seated + SourceSectionId → clone template Seats → EventSeats
    ///   Standing                 → generate Capacity slots (GA-1..GA-N)
    ///   Seated + no source       → skip (no template to clone from)
    /// </summary>
    Task<ApiResponse<GenerateEventSeatsResponse>> GenerateSeatsForEventAsync(
        Guid eventId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all EventSeats for an event, grouped-flat (all sections combined).
    /// </summary>
    Task<ApiResponse<IEnumerable<EventSeatResponse>>> GetByEventIdAsync(
        Guid eventId, CancellationToken cancellationToken = default);

    // ─── Seat Hold Operations ────────────────────────────────────────────

    /// <summary>
    /// Hold a single seat for a user. Uses sp_ManageSeating HOLD action.
    /// Hold expires after holdDurationSeconds (default 600 = 10 minutes).
    ///
    /// Pre-conditions:
    ///   - Seat must exist and belong to the specified event.
    ///   - Seat must be Available or have an expired hold.
    ///
    /// Returns: SeatHoldResponse with the held seat details.
    /// Errors:
    ///   - SEAT_NOT_FOUND: Seat doesn't exist
    ///   - SEAT_UNAVAILABLE: Seat is already held by another user
    /// </summary>
    Task<ApiResponse<SeatHoldResponse>> HoldSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Release a held seat back to Available status.
    /// Only the user who holds the seat can release it.
    ///
    /// Returns: SeatReleaseResponse with confirmation.
    /// Errors:
    ///   - SEAT_NOT_FOUND: Seat doesn't exist
    ///   - NOT_HELD_BY_USER: Seat is not held by this user
    /// </summary>
    Task<ApiResponse<SeatReleaseResponse>> ReleaseSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Hold multiple standing section slots for a user.
    /// Atomically holds up to `quantity` available slots in the section.
    ///
    /// Returns: StandingHoldResponse with the list of held seat IDs.
    /// Errors:
    ///   - SECTION_NOT_FOUND: Section doesn't exist
    ///   - INSUFFICIENT_AVAILABILITY: Not enough available slots
    /// </summary>
    Task<ApiResponse<StandingHoldResponse>> HoldStandingAsync(
        Guid eventId, Guid eventSectionId, Guid userId, int quantity, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default);
}
