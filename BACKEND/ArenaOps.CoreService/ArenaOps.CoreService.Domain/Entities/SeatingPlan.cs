namespace ArenaOps.CoreService.Domain.Entities;

public class SeatingPlan
{
    public Guid SeatingPlanId { get; set; }
    public Guid StadiumId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public Stadium Stadium { get; set; } = null!;
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Landmark> Landmarks { get; set; } = new List<Landmark>();
}
