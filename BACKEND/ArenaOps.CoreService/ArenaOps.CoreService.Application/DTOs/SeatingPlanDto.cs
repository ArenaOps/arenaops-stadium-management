namespace ArenaOps.CoreService.Application.DTOs;

public class SeatingPlanDto
{
    public Guid SeatingPlanId { get; set; }
    public Guid StadiumId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FieldConfigMetadata { get; set; }
    public int? TotalCapacity { get; set; }

    public ICollection<SectionDto> Sections { get; set; } = new List<SectionDto>();
    public ICollection<LandmarkDto> Landmarks { get; set; } = new List<LandmarkDto>();
}
