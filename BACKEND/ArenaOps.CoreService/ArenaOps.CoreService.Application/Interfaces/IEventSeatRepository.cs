using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Application.DTOs;

namespace ArenaOps.CoreService.Application.Interfaces;

/// <summary>
/// Repository interface for EventSeat data access.
///
/// WHY BulkCreateAsync instead of individual CreateAsync?
/// Seat generation produces hundreds of rows at once (one per template Seat per section).
/// Using AddRange + single SaveChangesAsync is far more efficient than N individual inserts.
///
/// WHY AnyExistForEventAsync?
/// Idempotency guard — prevents re-generating seats if they already exist for the event.
/// </summary>
public interface IEventSeatRepository
{
    /// <summary>
    /// Bulk-insert a list of EventSeats in a single transaction.
    /// Returns the count of rows inserted.
    /// </summary>
    Task<int> BulkCreateAsync(IEnumerable<EventSeat> seats, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all EventSeats for a specific EventSection.
    /// Ordered by RowLabel then SeatNumber for consistent display.
    /// </summary>
    Task<IEnumerable<EventSeat>> GetByEventSectionIdAsync(Guid eventSectionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all EventSeats across all sections for an event.
    /// Traverses: EventSeatingPlan → EventSections → EventSeats.
    /// </summary>
    Task<IEnumerable<EventSeat>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check whether any EventSeats already exist for the given event.
    /// Used for idempotency — reject if seats have already been generated.
    /// </summary>
    Task<bool> AnyExistForEventAsync(Guid eventId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the template Seats for a given SourceSectionId, including section navigation.
    /// Used during Seated section cloning to enumerate seats to copy.
    /// </summary>
    Task<IEnumerable<Seat>> GetTemplateSeatsBySourceSectionIdAsync(Guid sourceSectionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetch the minimum ticket price for each EventSection in a single query.
    /// Traverses: EventSection → SectionTicketType → TicketType.Price
    ///
    /// Returns a dictionary keyed by EventSectionId.
    /// Sections with no SectionTicketType mapping will NOT appear in the dictionary (return null when looked up).
    ///
    /// WHY MIN()? If an EventSection has multiple TicketTypes (e.g., Adult + Child),
    /// we snapshot the cheapest price as the seat-level price.
    /// </summary>
    Task<Dictionary<Guid, decimal?>> GetMinPricesByEventSectionIdsAsync(
        IEnumerable<Guid> eventSectionIds, CancellationToken cancellationToken = default);

    // ─── Seat Hold Operations (via sp_ManageSeating) ─────────────────────

    /// <summary>
    /// Hold a single seat using sp_ManageSeating with Action='HOLD'.
    /// Returns the stored procedure result (Status, Message, AffectedCount).
    /// </summary>
    Task<SeatOperationResult> HoldSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Release a held seat by setting it back to Available.
    /// Only the user who holds the seat can release it.
    /// </summary>
    Task<SeatOperationResult> ReleaseSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a single EventSeat by ID.
    /// </summary>
    Task<EventSeat?> GetByIdAsync(Guid eventSeatId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get available seats for a standing section (for bulk hold).
    /// Returns seats with Status = 'Available' or expired holds.
    /// </summary>
    Task<IEnumerable<EventSeat>> GetAvailableStandingSeatsAsync(
        Guid eventId, Guid eventSectionId, int quantity,
        CancellationToken cancellationToken = default);
}
