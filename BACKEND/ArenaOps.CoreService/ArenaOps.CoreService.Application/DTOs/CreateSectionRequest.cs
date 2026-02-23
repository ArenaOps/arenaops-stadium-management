using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class CreateSectionRequest
{
    [Required]
    public Guid SeatingPlanId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Seated|Standing)$", ErrorMessage = "Type must be 'Seated' or 'Standing'")]
    public string Type { get; set; } = "Seated";

    /// <summary>
    /// Required for Standing sections — total standing capacity
    /// </summary>
    [Range(0, int.MaxValue)]
    public int Capacity { get; set; }

    /// <summary>
    /// Seat category: VIP, Premium, Standard, etc. (used for Seated sections)
    /// </summary>
    [StringLength(50)]
    public string? SeatType { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public double PosX { get; set; }
    public double PosY { get; set; }
}
