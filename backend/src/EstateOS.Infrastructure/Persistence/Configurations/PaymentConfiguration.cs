using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EstateOS.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments", t => t.HasCheckConstraint(
            "ck_payments_paid_requires_paid_at",
            "\"Status\" <> 'Paid' OR \"PaidAt\" IS NOT NULL"));
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Amount).HasPrecision(14, 2);
        builder.Property(p => p.PaymentMethod).HasMaxLength(50);

        builder.HasOne(p => p.Contract)
            .WithMany(c => c.Payments)
            .HasForeignKey(p => p.ContractId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Property)
            .WithMany(pr => pr.Payments)
            .HasForeignKey(p => p.PropertyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Tenant)
            .WithMany(t => t.Payments)
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.PropertyId, p.Status });
    }
}
