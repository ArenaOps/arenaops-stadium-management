using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class CreateLandmarkRequest
{
    /// <summary>
    /// Set by controller from route parameter — not from request body.
    /// </summary>
    public Guid SeatingPlanId { get; set; }

    /// <summary>
    /// Landmark type: STAGE, GATE, EXIT, RESTROOM, etc.
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Type { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Label { get; set; }

    public double PosX { get; set; }
    public double PosY { get; set; }

    [Range(0, double.MaxValue)]
    public double Width { get; set; }

    [Range(0, double.MaxValue)]
    public double Height { get; set; }
}
