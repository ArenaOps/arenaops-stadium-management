using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class CreateSeatRequest
{
    /// <summary>
    /// Set by controller from route parameter — not from request body.
    /// </summary>
    public Guid SectionId { get; set; }

    [StringLength(5)]
    public string? RowLabel { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "SeatNumber must be at least 1")]
    public int SeatNumber { get; set; }

    /// <summary>
    /// e.g., "A1", "B12". Auto-generated from RowLabel + SeatNumber if not provided.
    /// </summary>
    [StringLength(10)]
    public string? SeatLabel { get; set; }

    public double PosX { get; set; }
    public double PosY { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsAccessible { get; set; }
}
