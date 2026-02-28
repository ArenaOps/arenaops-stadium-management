using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class UpdateSeatRequest
{
    [StringLength(5)]
    public string? RowLabel { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "SeatNumber must be at least 1")]
    public int SeatNumber { get; set; }

    [StringLength(10)]
    public string? SeatLabel { get; set; }

    public double PosX { get; set; }
    public double PosY { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsAccessible { get; set; }
}
