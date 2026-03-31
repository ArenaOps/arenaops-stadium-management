using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Infrastructure.Services;

/// <summary>
/// Business logic for EventSeat generation and retrieval.
///
/// GENERATION FLOW (GenerateSeatsForEventAsync):
///
///   1. Load layout by eventId — needs EventSections to know what to generate.
///   2. Validate layout exists and is LOCKED.
///      WHY require lock? Locking the layout freezes the section configuration.
///      Generating seats against an editable layout could produce phantom EventSeats
///      for sections that an EventManager subsequently moves, resizes, or deletes.
///   3. Idempotency check — reject if EventSeats already exist for the event.
///      This prevents double-generation on accidental double-POST.
///   4. Pre-fetch all prices in one query (dictionary by EventSectionId).
///   5. Per-section:
///        Seated + SourceSectionId → clone template Seats via GetTemplateSeatsBySourceSectionIdAsync
///        Standing                 → generate Capacity slots ("GA-1"..."GA-N")
///        Seated + no source       → skip (custom, no template to clone from)
///   6. Bulk-insert ALL EventSeats in one SaveChangesAsync.
///   7. Return GenerateEventSeatsResponse with totals + per-section breakdown.
/// </summary>
public class EventSeatService : IEventSeatService
{
    private readonly IEventSeatRepository _eventSeatRepo;
    private readonly IEventLayoutRepository _eventLayoutRepo;

    public EventSeatService(
        IEventSeatRepository eventSeatRepo,
        IEventLayoutRepository eventLayoutRepo)
    {
        _eventSeatRepo = eventSeatRepo;
        _eventLayoutRepo = eventLayoutRepo;
    }

    public async Task<ApiResponse<GenerateEventSeatsResponse>> GenerateSeatsForEventAsync(
        Guid eventId, Guid userId, CancellationToken cancellationToken = default)
    {
        // ── STEP 1: Load layout ──────────────────────────────────────
        var layout = await _eventLayoutRepo.GetByEventIdAsync(eventId, cancellationToken);
        if (layout == null)
        {
            return ApiResponse<GenerateEventSeatsResponse>.Fail(
                "LAYOUT_NOT_FOUND",
                "No seating layout found for this event. Clone a template before generating seats.");
        }

        // ── STEP 2: Require locked layout ────────────────────────────
        // WHY: An unlocked layout can still be edited — sections may be added/removed.
        // Generating seats against an in-flux layout risks orphaned EventSeats.
        if (!layout.IsLocked)
        {
            return ApiResponse<GenerateEventSeatsResponse>.Fail(
                "LAYOUT_NOT_LOCKED",
                "The seating layout must be locked before generating seats. Lock the layout first.");
        }

        // ── STEP 3: Idempotency guard ────────────────────────────────
        var alreadyGenerated = await _eventSeatRepo.AnyExistForEventAsync(eventId, cancellationToken);
        if (alreadyGenerated)
        {
            return ApiResponse<GenerateEventSeatsResponse>.Fail(
                "SEATS_ALREADY_GENERATED",
                "EventSeats have already been generated for this event. Generation cannot be repeated.");
        }

        var sections = layout.EventSections.ToList();
        if (sections.Count == 0)
        {
            return ApiResponse<GenerateEventSeatsResponse>.Fail(
                "NO_SECTIONS",
                "The event layout has no sections. Add sections to the layout before generating seats.");
        }

        // ── STEP 4: Pre-fetch prices (one DB query) ──────────────────
        // WHY pre-fetch? If we queried price per-section inside the loop that would be N+1.
        // One GROUP BY query over SectionTicketTypes → one dictionary for O(1) lookups.
        var sectionIds = sections.Select(s => s.EventSectionId).ToList();
        var priceDict = await _eventSeatRepo.GetMinPricesByEventSectionIdsAsync(sectionIds, cancellationToken);

        // ── STEP 5: Build EventSeats per section ─────────────────────
        var allSeats = new List<EventSeat>();
        var summaries = new List<SectionGenerationSummary>();

        int seatedProcessed = 0;
        int standingProcessed = 0;
        int skipped = 0;

        foreach (var section in sections)
        {
            var price = priceDict.GetValueOrDefault(section.EventSectionId);

            if (section.Type == "Seated")
            {
                if (section.SourceSectionId == null)
                {
                    // Custom Seated section (EventManager-added, no template) — skip.
                    // Cannot generate seats without a template to clone from.
                    skipped++;
                    summaries.Add(new SectionGenerationSummary
                    {
                        EventSectionId = section.EventSectionId,
                        SectionName = section.Name,
                        SectionType = section.Type,
                        SeatsGenerated = 0,
                        Result = "Skipped"
                    });
                    continue;
                }

                // Clone template Seats → EventSeats
                var templateSeats = await _eventSeatRepo.GetTemplateSeatsBySourceSectionIdAsync(
                    section.SourceSectionId.Value, cancellationToken);

                var cloned = templateSeats.Select(s => new EventSeat
                {
                    EventSeatId = Guid.NewGuid(),
                    EventId = eventId,
                    EventSectionId = section.EventSectionId,
                    SourceSeatId = s.SeatId,
                    SectionType = section.Type,
                    RowLabel = s.RowLabel,
                    SeatNumber = s.SeatNumber,
                    SeatLabel = s.SeatLabel,
                    PosX = s.PosX,
                    PosY = s.PosY,
                    IsActive = s.IsActive,
                    IsAccessible = s.IsAccessible,
                    Price = price,
                    Status = "Available"
                }).ToList();

                allSeats.AddRange(cloned);
                seatedProcessed++;

                summaries.Add(new SectionGenerationSummary
                {
                    EventSectionId = section.EventSectionId,
                    SectionName = section.Name,
                    SectionType = section.Type,
                    SeatsGenerated = cloned.Count,
                    Result = "Generated"
                });
            }
            else // Standing
            {
                // Generate N capacity slots. Slot labels: "GA-1", "GA-2", ..., "GA-N".
                // No SourceSeatId — these have no template seat counterpart.
                var slots = Enumerable.Range(1, section.Capacity)
                    .Select(n => new EventSeat
                    {
                        EventSeatId = Guid.NewGuid(),
                        EventId = eventId,
                        EventSectionId = section.EventSectionId,
                        SourceSeatId = null,
                        SectionType = section.Type,
                        RowLabel = null,
                        SeatNumber = n,
                        SeatLabel = $"GA-{n}",
                        PosX = 0,
                        PosY = 0,
                        IsActive = true,
                        IsAccessible = false,
                        Price = price,
                        Status = "Available"
                    }).ToList();

                allSeats.AddRange(slots);
                standingProcessed++;

                summaries.Add(new SectionGenerationSummary
                {
                    EventSectionId = section.EventSectionId,
                    SectionName = section.Name,
                    SectionType = section.Type,
                    SeatsGenerated = slots.Count,
                    Result = "Generated"
                });
            }
        }

        // ── STEP 6: Bulk-insert all EventSeats in one transaction ────
        var totalInserted = await _eventSeatRepo.BulkCreateAsync(allSeats, cancellationToken);

        // ── STEP 7: Return summary ───────────────────────────────────
        var result = new GenerateEventSeatsResponse
        {
            TotalSeatsGenerated = totalInserted,
            SeatedSectionsProcessed = seatedProcessed,
            StandingSectionsProcessed = standingProcessed,
            SectionsSkipped = skipped,
            Sections = summaries
        };

        return ApiResponse<GenerateEventSeatsResponse>.Ok(
            result,
            $"Successfully generated {totalInserted} event seats across " +
            $"{seatedProcessed + standingProcessed} sections.");
    }

    public async Task<ApiResponse<IEnumerable<EventSeatResponse>>> GetByEventIdAsync(
        Guid eventId, CancellationToken cancellationToken = default)
    {
        var seats = await _eventSeatRepo.GetByEventIdAsync(eventId, cancellationToken);
        return ApiResponse<IEnumerable<EventSeatResponse>>.Ok(seats.Select(MapToResponse));
    }

    // ─── Seat Hold Operations ────────────────────────────────────────────

    public async Task<ApiResponse<SeatHoldResponse>> HoldSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default)
    {
        // Verify seat exists and belongs to the event
        var seat = await _eventSeatRepo.GetByIdAsync(eventSeatId, cancellationToken);
        if (seat == null)
        {
            return ApiResponse<SeatHoldResponse>.Fail(
                "SEAT_NOT_FOUND",
                "The specified seat does not exist.");
        }

        if (seat.EventId != eventId)
        {
            return ApiResponse<SeatHoldResponse>.Fail(
                "SEAT_NOT_FOUND",
                "The seat does not belong to the specified event.");
        }

        // Call stored procedure via repository
        var result = await _eventSeatRepo.HoldSeatAsync(eventId, eventSeatId, userId, holdDurationSeconds, cancellationToken);

        if (!result.IsSuccess)
        {
            var errorCode = result.IsBusinessRuleViolation ? "SEAT_UNAVAILABLE" : "HOLD_FAILED";
            return ApiResponse<SeatHoldResponse>.Fail(errorCode, result.Message);
        }

        // Fetch updated seat to get LockedUntil
        var updatedSeat = await _eventSeatRepo.GetByIdAsync(eventSeatId, cancellationToken);

        return ApiResponse<SeatHoldResponse>.Ok(new SeatHoldResponse
        {
            EventSeatId = eventSeatId,
            EventId = eventId,
            Status = "Held",
            LockedUntil = updatedSeat?.LockedUntil,
            Message = result.Message
        }, result.Message);
    }

    public async Task<ApiResponse<SeatReleaseResponse>> ReleaseSeatAsync(
        Guid eventId, Guid eventSeatId, Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Verify seat exists
        var seat = await _eventSeatRepo.GetByIdAsync(eventSeatId, cancellationToken);
        if (seat == null)
        {
            return ApiResponse<SeatReleaseResponse>.Fail(
                "SEAT_NOT_FOUND",
                "The specified seat does not exist.");
        }

        if (seat.EventId != eventId)
        {
            return ApiResponse<SeatReleaseResponse>.Fail(
                "SEAT_NOT_FOUND",
                "The seat does not belong to the specified event.");
        }

        // Call repository to release
        var result = await _eventSeatRepo.ReleaseSeatAsync(eventId, eventSeatId, userId, cancellationToken);

        if (!result.IsSuccess)
        {
            var errorCode = result.IsBusinessRuleViolation ? "NOT_HELD_BY_USER" : "RELEASE_FAILED";
            return ApiResponse<SeatReleaseResponse>.Fail(errorCode, result.Message);
        }

        return ApiResponse<SeatReleaseResponse>.Ok(new SeatReleaseResponse
        {
            EventSeatId = eventSeatId,
            EventId = eventId,
            Status = "Available",
            Message = result.Message
        }, result.Message);
    }

    public async Task<ApiResponse<StandingHoldResponse>> HoldStandingAsync(
        Guid eventId, Guid eventSectionId, Guid userId, int quantity, int holdDurationSeconds = 600,
        CancellationToken cancellationToken = default)
    {
        if (quantity <= 0)
        {
            return ApiResponse<StandingHoldResponse>.Fail(
                "INVALID_QUANTITY",
                "Quantity must be greater than zero.");
        }

        // Get available standing seats
        var availableSeats = (await _eventSeatRepo.GetAvailableStandingSeatsAsync(
            eventId, eventSectionId, quantity, cancellationToken)).ToList();

        if (availableSeats.Count == 0)
        {
            return ApiResponse<StandingHoldResponse>.Fail(
                "SECTION_NOT_FOUND",
                "No available standing seats found in the specified section.");
        }

        if (availableSeats.Count < quantity)
        {
            return ApiResponse<StandingHoldResponse>.Fail(
                "INSUFFICIENT_AVAILABILITY",
                $"Only {availableSeats.Count} seats available, but {quantity} requested.");
        }

        // Hold each seat
        var heldSeatIds = new List<Guid>();
        DateTime? lockedUntil = null;

        foreach (var seat in availableSeats.Take(quantity))
        {
            var result = await _eventSeatRepo.HoldSeatAsync(
                eventId, seat.EventSeatId, userId, holdDurationSeconds, cancellationToken);

            if (result.IsSuccess)
            {
                heldSeatIds.Add(seat.EventSeatId);
                if (lockedUntil == null)
                {
                    var updatedSeat = await _eventSeatRepo.GetByIdAsync(seat.EventSeatId, cancellationToken);
                    lockedUntil = updatedSeat?.LockedUntil;
                }
            }
        }

        if (heldSeatIds.Count == 0)
        {
            return ApiResponse<StandingHoldResponse>.Fail(
                "HOLD_FAILED",
                "Failed to hold any standing seats. They may have been taken by another user.");
        }

        return ApiResponse<StandingHoldResponse>.Ok(new StandingHoldResponse
        {
            EventId = eventId,
            EventSectionId = eventSectionId,
            QuantityHeld = heldSeatIds.Count,
            HeldSeatIds = heldSeatIds,
            LockedUntil = lockedUntil,
            Message = $"Successfully held {heldSeatIds.Count} standing tickets."
        }, $"Successfully held {heldSeatIds.Count} standing tickets.");
    }

    // ─── Mapping ──────────────────────────────────────────────────

    private static EventSeatResponse MapToResponse(EventSeat seat)
    {
        return new EventSeatResponse
        {
            EventSeatId = seat.EventSeatId,
            EventId = seat.EventId,
            EventSectionId = seat.EventSectionId,
            SourceSeatId = seat.SourceSeatId,
            SectionType = seat.SectionType,
            RowLabel = seat.RowLabel,
            SeatNumber = seat.SeatNumber,
            SeatLabel = seat.SeatLabel,
            PosX = seat.PosX,
            PosY = seat.PosY,
            IsActive = seat.IsActive,
            IsAccessible = seat.IsAccessible,
            Price = seat.Price,
            Status = seat.Status,
            LockedUntil = seat.LockedUntil,
            LockedByUserId = seat.LockedByUserId
        };
    }
}
