using Microsoft.EntityFrameworkCore;
using ArenaOps.CoreService.Domain.Entities;

namespace ArenaOps.CoreService.Infrastructure.Data;

public class CoreDbContext : DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options) : base(options) { }

    public DbSet<Stadium> Stadiums => Set<Stadium>();
    public DbSet<SeatingPlan> SeatingPlans => Set<SeatingPlan>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Landmark> Landmarks => Set<Landmark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Stadium ───────────────────────────────────────────────
        modelBuilder.Entity<Stadium>(entity =>
        {
            entity.HasKey(e => e.StadiumId);
            entity.Property(e => e.StadiumId).HasDefaultValueSql("NEWSEQUENTIALID()");

            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Address).HasMaxLength(300).IsRequired();
            entity.Property(e => e.City).HasMaxLength(100).IsRequired();
            entity.Property(e => e.State).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Country).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Pincode).HasMaxLength(10).IsRequired();

            entity.Property(e => e.Latitude).HasPrecision(9, 6);
            entity.Property(e => e.Longitude).HasPrecision(9, 6);

            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(e => e.SeatingPlans)
                  .WithOne(sp => sp.Stadium)
                  .HasForeignKey(sp => sp.StadiumId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── SeatingPlan ───────────────────────────────────────────
        modelBuilder.Entity<SeatingPlan>(entity =>
        {
            entity.HasKey(e => e.SeatingPlanId);
            entity.Property(e => e.SeatingPlanId).HasDefaultValueSql("NEWSEQUENTIALID()");

            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(e => e.Sections)
                  .WithOne(s => s.SeatingPlan)
                  .HasForeignKey(s => s.SeatingPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Landmarks)
                  .WithOne(l => l.SeatingPlan)
                  .HasForeignKey(l => l.SeatingPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Section ───────────────────────────────────────────────
        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.SectionId);
            entity.Property(e => e.SectionId).HasDefaultValueSql("NEWSEQUENTIALID()");

            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Type).HasMaxLength(20).IsRequired();
            entity.Property(e => e.SeatType).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);

            entity.HasMany(e => e.Seats)
                  .WithOne(s => s.Section)
                  .HasForeignKey(s => s.SectionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Seat ──────────────────────────────────────────────────
        modelBuilder.Entity<Seat>(entity =>
        {
            entity.HasKey(e => e.SeatId);
            entity.Property(e => e.SeatId).HasDefaultValueSql("NEWSEQUENTIALID()");

            entity.Property(e => e.RowLabel).HasMaxLength(5);
            entity.Property(e => e.SeatLabel).HasMaxLength(10);

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsAccessible).HasDefaultValue(false);
        });

        // ─── Landmark ──────────────────────────────────────────────
        modelBuilder.Entity<Landmark>(entity =>
        {
            entity.HasKey(e => e.FeatureId);
            entity.Property(e => e.FeatureId).HasDefaultValueSql("NEWSEQUENTIALID()");

            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Label).HasMaxLength(100);
        });
    }
}
