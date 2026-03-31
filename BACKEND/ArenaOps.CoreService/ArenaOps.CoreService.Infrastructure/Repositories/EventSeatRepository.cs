using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.CoreService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;

namespace ArenaOps.CoreService.Infrastructure.Repositories;

/// <summary>
/// EF Core repository for EventSeat data access.
///
/// Key design decisions:
/// - BulkCreateAsync uses AddRange + single SaveChangesAsync for performance.
///   Generating seats produces hundreds of rows — one DB round-trip is critical.
/// - GetByEventIdAsync traverses EventSeatingPlan → EventSections → EventSeats via joins
///   instead of N+1 queries per section.
/// </summary>
public class EventSeatRepository : IEventSeatRepository
{
    private readonly CoreDbContext _context;

    public EventSeatRepository(CoreDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Bulk-insert EventSeats in a single transaction.
    /// Returns the count of rows saved.
    /// </summary>
    public async Task<int> BulkCreateAsync(IEnumerable<EventSeat> seats, CancellationToken cancellationToken = default)
    {
        var seatList = seats.ToList();
        if (seatList.Count == 0)
            return 0;

        _context.EventSeats.AddRange(seatList);
        await _context.SaveChangesAsync(cancellationToken);
        return seatList.Count;
    }

    /// <summary>
    /// Get all EventSeats for a single EventSection, ordered for consistent display.
    /// </summary>
    public async Task<IEnumerable<EventSeat>> GetByEventSectionIdAsync(
        Guid eventSectionId, CancellationToken cancellationToken = default)
    {
        return await _context.EventSeats
            .Where(es => es.EventSectionId == eventSectionId)
            .OrderBy(es => es.RowLabel)
            .ThenBy(es => es.SeatNumber)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Get all EventSeats across an entire event.
    ///
    /// WHY join through EventSeatingPlan instead of a direct FK from EventSeat to EventId?
    /// EventSeat → EventSection → EventSeatingPlan → EventId is the canonical relationship.
    /// Adding a redundant EventId FK on EventSeat would denormalize the schema.
    /// </summary>
    public async Task<IEnumerable<EventSeat>> GetByEventIdAsync(
        Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _context.EventSeats
            .Where(es => es.EventSection.EventSeatingPlan.EventId == eventId)
            .OrderBy(es => es.EventSection.Name)
            .ThenBy(es => es.RowLabel)
            .ThenBy(es => es.SeatNumber)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Idempotency check — returns true if any EventSeats exist for the event.
    /// Used to reject double-generation calls.
    /// </summary>
    public async Task<bool> AnyExistForEventAsync(
        Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _context.EventSeats
            .AnyAsync(es => es.EventSection.EventSeatingPlan.EventId == eventId, cancellationToken);
    }

    /// <summary>
    /// Fetch template Seats for a given Section (SourceSectionId).
    /// Used during Seated section cloning to enumerate the seats to copy.
    /// Ordered the same way as GetBySectionIdAsync — Row then SeatNumber.
    /// </summary>
    public async Task<IEnumerable<Seat>> GetTemplateSeatsBySourceSectionIdAsync(
        Guid sourceSectionId, CancellationToken cancellationToken = default)
    {
        return await _context.Seats
            .Where(s => s.SectionId == sourceSectionId)
            .OrderBy(s => s.RowLabel)
            .ThenBy(s => s.SeatNumber)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Fetch minimum TicketType.Price per EventSectionId in one SQL query.
    ///
    /// SQL equivalent:
    ///   SELECT stt.EventSectionId, MIN(tt.Price)
    ///   FROM SectionTicketTypes stt
    ///   JOIN TicketTypes tt ON tt.TicketTypeId = stt.TicketTypeId
    ///   WHERE stt.EventSectionId IN (...)
    ///   GROUP BY stt.EventSectionId
    ///
    /// Returns a dictionary. EventSections with no mapping are absent → caller gets null.
    /// </summary>
    public async Task<Dictionary<Guid, decimal?>> GetMinPricesByEventSectionIdsAsync(
        IEnumerable<Guid> eventSectionIds, CancellationToken cancellationToken = default)
    {
        var ids = eventSectionIds.ToList();
        if (ids.Count == 0)
            return new Dictionary<Guid, decimal?>();

        return await _context.SectionTicketTypes
            .Where(stt => ids.Contains(stt.EventSectionId))
            .GroupBy(stt => stt.EventSectionId)
            .Select(g => new
            {
                EventSectionId = g.Key,
                MinPrice = g.Min(stt => (decimal?)stt.TicketType.Price)
            })
            .ToDictionaryAsync(
                x => x.EventSectionId,
                x => x.MinPrice,
                cancellationToken);
    }

    // ─── Seat Hold Operations (via sp_ManageSeating) ─────────────────────

    /// <summary>
    /// Hold a single seat using sp_ManageSeating stored procedure.
    /// Uses Dapper for direct SQL execution with output parameters.
    /// </summary>
    public async Task<SeatOperationResult> HoldSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default)
    {
        var connection = _context.Database.GetDbConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Action", "HOLD");
        parameters.Add("@EventId", eventId);
        parameters.Add("@EventSeatId", eventSeatId);
        parameters.Add("@UserId", userId);
        parameters.Add("@HoldDurationSeconds", holdDurationSeconds);
        parameters.Add("@EventSeatIds", null); // Not used for HOLD

        var result = await connection.QueryFirstOrDefaultAsync<SeatOperationResult>(
            "sp_ManageSeating",
            parameters,
            commandType: CommandType.StoredProcedure);

        return result ?? new SeatOperationResult
        {
            Status = 1,
            Message = "No response from stored procedure",
            AffectedCount = 0
        };
    }

    /// <summary>
    /// Release a held seat. Uses direct SQL update (not the SP) since SP doesn't have RELEASE action.
    /// Only releases if the seat is held by the specified user.
    /// </summary>
    public async Task<SeatOperationResult> ReleaseSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Direct SQL update - more efficient than loading entity + SaveChanges
        var connection = _context.Database.GetDbConnection();

        var sql = @"
            UPDATE EventSeats
            SET Status = 'Available',
                LockedByUserId = NULL,
                LockedUntil = NULL
            WHERE EventSeatId = @EventSeatId
              AND EventId = @EventId
              AND LockedByUserId = @UserId
              AND Status = 'Held';

            SELECT @@ROWCOUNT AS AffectedCount;
        ";

        var affectedCount = await connection.ExecuteScalarAsync<int>(
            sql,
            new { EventSeatId = eventSeatId, EventId = eventId, UserId = userId });

        if (affectedCount > 0)
        {
            return new SeatOperationResult
            {
                Status = 0,
                Message = "Seat released successfully.",
                AffectedCount = affectedCount
            };
        }

        return new SeatOperationResult
        {
            Status = 2,
            Message = "Seat is not held by this user or does not exist.",
            AffectedCount = 0
        };
    }

    /// <summary>
    /// Get a single EventSeat by ID.
    /// </summary>
    public async Task<EventSeat?> GetByIdAsync(Guid eventSeatId, CancellationToken cancellationToken = default)
    {
        return await _context.EventSeats
            .FirstOrDefaultAsync(es => es.EventSeatId == eventSeatId, cancellationToken);
    }

    /// <summary>
    /// Get available seats for a standing section.
    /// Returns seats that are Available or have expired holds.
    /// </summary>
    public async Task<IEnumerable<EventSeat>> GetAvailableStandingSeatsAsync(
        Guid eventId, Guid eventSectionId, int quantity,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.EventSeats
            .Where(es => es.EventId == eventId
                && es.EventSectionId == eventSectionId
                && es.SectionType == "Standing"
                && (es.Status == "Available" || (es.Status == "Held" && es.LockedUntil < now)))
            .Take(quantity)
            .ToListAsync(cancellationToken);
    }
}
