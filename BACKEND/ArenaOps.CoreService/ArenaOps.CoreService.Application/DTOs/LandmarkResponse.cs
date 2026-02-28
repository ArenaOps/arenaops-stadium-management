namespace ArenaOps.CoreService.Application.DTOs;

public class LandmarkResponse
{
    public Guid FeatureId { get; set; }
    public Guid SeatingPlanId { get; set; }
    public string SeatingPlanName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Label { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
}
