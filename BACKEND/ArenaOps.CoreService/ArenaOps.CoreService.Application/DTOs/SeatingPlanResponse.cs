namespace ArenaOps.CoreService.Application.DTOs;

public class SeatingPlanResponse
{
    public Guid SeatingPlanId { get; set; }
    public Guid StadiumId { get; set; }
    public string StadiumName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public int SectionCount { get; set; }
    public int LandmarkCount { get; set; }
}
