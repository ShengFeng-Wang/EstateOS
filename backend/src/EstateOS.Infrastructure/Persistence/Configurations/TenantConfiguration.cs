using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EstateOS.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Phone).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(320);
        builder.Property(t => t.IdentityReference).HasMaxLength(100);
        builder.Property(t => t.EmergencyContact).HasMaxLength(200);
    }
}
