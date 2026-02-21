using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class UpdateSeatingPlanRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}
