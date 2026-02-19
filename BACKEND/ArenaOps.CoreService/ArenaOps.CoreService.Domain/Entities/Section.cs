namespace ArenaOps.CoreService.Domain.Entities;

public class Section
{
    public Guid SectionId { get; set; }
    public Guid SeatingPlanId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Seated"; // "Seated" or "Standing"
    public int Capacity { get; set; } // Used for Standing sections
    public string? SeatType { get; set; } // VIP, Premium, Standard, etc.
    public string? Color { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }

    // Navigation Properties
    public SeatingPlan SeatingPlan { get; set; } = null!;
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}
