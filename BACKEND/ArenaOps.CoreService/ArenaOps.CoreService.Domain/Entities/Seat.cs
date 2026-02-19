namespace ArenaOps.CoreService.Domain.Entities;

public class Seat
{
    public Guid SeatId { get; set; }
    public Guid SectionId { get; set; }
    public string? RowLabel { get; set; }
    public int SeatNumber { get; set; }
    public string? SeatLabel { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAccessible { get; set; }

    public Section Section { get; set; } = null!;
}
