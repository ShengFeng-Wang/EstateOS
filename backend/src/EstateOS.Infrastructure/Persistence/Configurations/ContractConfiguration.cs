using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EstateOS.Infrastructure.Persistence.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("contracts", t => t.HasCheckConstraint("ck_contracts_end_after_start", "\"EndDate\" > \"StartDate\""));
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.MonthlyRent).HasPrecision(14, 2);
        builder.Property(c => c.Deposit).HasPrecision(14, 2);

        builder.HasOne(c => c.Property)
            .WithMany(p => p.Contracts)
            .HasForeignKey(c => c.PropertyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Tenant)
            .WithMany(t => t.Contracts)
            .HasForeignKey(c => c.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => new { c.PropertyId, c.Status });
    }
}
