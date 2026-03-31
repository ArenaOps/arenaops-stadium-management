namespace ArenaOps.CoreService.Application.DTOs;

/// <summary>
/// Response from sp_ManageSeating stored procedure.
/// Maps the three output columns: Status, Message, AffectedCount.
/// </summary>
public class SeatOperationResult
{
    /// <summary>
    /// 0 = Success, 1 = Error, 2 = Business Rule Violation
    /// </summary>
    public int Status { get; set; }

    /// <summary>
    /// Human-readable message from the stored procedure.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Number of rows affected by the operation.
    /// </summary>
    public int AffectedCount { get; set; }

    public bool IsSuccess => Status == 0;
    public bool IsBusinessRuleViolation => Status == 2;
}

/// <summary>
/// Response DTO for seat hold operations.
/// </summary>
public class SeatHoldResponse
{
    public Guid EventSeatId { get; set; }
    public Guid EventId { get; set; }
    public string Status { get; set; } = "Held";
    public DateTime? LockedUntil { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for seat release operations.
/// </summary>
public class SeatReleaseResponse
{
    public Guid EventSeatId { get; set; }
    public Guid EventId { get; set; }
    public string Status { get; set; } = "Available";
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for holding multiple standing section slots.
/// </summary>
public class HoldStandingRequest
{
    /// <summary>
    /// Number of standing tickets to hold.
    /// </summary>
    public int Quantity { get; set; }
}

/// <summary>
/// Response DTO for standing section hold operations.
/// </summary>
public class StandingHoldResponse
{
    public Guid EventId { get; set; }
    public Guid EventSectionId { get; set; }
    public int QuantityHeld { get; set; }
    public List<Guid> HeldSeatIds { get; set; } = new();
    public DateTime? LockedUntil { get; set; }
    public string Message { get; set; } = string.Empty;
}
