using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EstateOS.Infrastructure.Persistence.Configurations;

public class MaintenanceRequestConfiguration : IEntityTypeConfiguration<MaintenanceRequest>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequest> builder)
    {
        builder.ToTable("maintenance_requests", t => t.HasCheckConstraint(
            "ck_maintenance_completed_requires_completed_at",
            "\"Status\" <> 'Completed' OR \"CompletedAt\" IS NOT NULL"));
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Title).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Description).IsRequired();
        builder.Property(m => m.Priority).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(m => m.Property)
            .WithMany(p => p.MaintenanceRequests)
            .HasForeignKey(m => m.PropertyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Assignee)
            .WithMany()
            .HasForeignKey(m => m.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(m => new { m.PropertyId, m.Status });
    }
}
