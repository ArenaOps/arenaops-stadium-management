namespace ArenaOps.CoreService.Application.DTOs;

public class SectionResponse
{
    public Guid SectionId { get; set; }
    public Guid SeatingPlanId { get; set; }
    public string SeatingPlanName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Seated";
    public int Capacity { get; set; }
    public string? SeatType { get; set; }
    public string? Color { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
    public int SeatCount { get; set; }
}
