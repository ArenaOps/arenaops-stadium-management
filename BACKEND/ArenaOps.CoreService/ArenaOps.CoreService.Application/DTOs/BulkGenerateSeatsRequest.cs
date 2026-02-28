using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class BulkGenerateSeatsRequest
{
    /// <summary>
    /// Set by controller from route parameter — not from request body.
    /// </summary>
    public Guid SectionId { get; set; }

    /// <summary>
    /// Number of rows to generate (e.g., 10 rows → A through J)
    /// </summary>
    [Required]
    [Range(1, 52, ErrorMessage = "Rows must be between 1 and 52")]
    public int Rows { get; set; }

    /// <summary>
    /// Number of seats per row (e.g., 20 seats per row → 1 through 20)
    /// </summary>
    [Required]
    [Range(1, 100, ErrorMessage = "SeatsPerRow must be between 1 and 100")]
    public int SeatsPerRow { get; set; }

    /// <summary>
    /// Optional starting row label (default: "A"). 
    /// Supports A-Z, then AA-AZ for rows beyond 26.
    /// </summary>
    [StringLength(5)]
    public string? StartRowLabel { get; set; }

    /// <summary>
    /// X position of the first seat in the grid (top-left corner)
    /// </summary>
    public double StartPosX { get; set; }

    /// <summary>
    /// Y position of the first seat in the grid (top-left corner)
    /// </summary>
    public double StartPosY { get; set; }

    /// <summary>
    /// Horizontal spacing between seats (default: 30)
    /// </summary>
    [Range(1, 200)]
    public double SpacingX { get; set; } = 30;

    /// <summary>
    /// Vertical spacing between rows (default: 35)
    /// </summary>
    [Range(1, 200)]
    public double SpacingY { get; set; } = 35;
}
