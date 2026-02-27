namespace ArenaOps.CoreService.Application.DTOs;

public class SeatResponse
{
    public Guid SeatId { get; set; }
    public Guid SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public string? RowLabel { get; set; }
    public int SeatNumber { get; set; }
    public string? SeatLabel { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
    public bool IsActive { get; set; }
    public bool IsAccessible { get; set; }
}
