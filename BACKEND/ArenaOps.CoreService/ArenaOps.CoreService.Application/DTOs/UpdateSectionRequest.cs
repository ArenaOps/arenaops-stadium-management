using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class UpdateSectionRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Seated|Standing)$", ErrorMessage = "Type must be 'Seated' or 'Standing'")]
    public string Type { get; set; } = "Seated";

    [Range(0, int.MaxValue)]
    public int Capacity { get; set; }

    [StringLength(50)]
    public string? SeatType { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public double PosX { get; set; }
    public double PosY { get; set; }
}
