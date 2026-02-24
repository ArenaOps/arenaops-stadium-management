namespace ArenaOps.Shared.Models;

public class CacheSettings
{
    public int DefaultTTLMinutes { get; set; } = 5;
    public int StadiumListTTLMinutes { get; set; } = 2;
    public int SeatingPlanTTLMinutes { get; set; } = 10;
}
