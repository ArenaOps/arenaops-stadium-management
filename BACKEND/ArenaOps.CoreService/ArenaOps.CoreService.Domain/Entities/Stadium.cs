namespace ArenaOps.CoreService.Domain.Entities;

public class Stadium
{
    public Guid StadiumId { get; set; }
    public Guid OwnerId { get; set; } // Reference to Auth.Users (NOT a local FK)
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<SeatingPlan> SeatingPlans { get; set; } = new List<SeatingPlan>();
}
