using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EstateOS.Infrastructure.Persistence.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("properties");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Address).IsRequired().HasMaxLength(400);
        builder.Property(p => p.City).IsRequired().HasMaxLength(100);
        builder.Property(p => p.District).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Type).HasConversion<string>().HasMaxLength(30);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.MonthlyRent).HasPrecision(14, 2);
        builder.Property(p => p.Size).HasPrecision(10, 2);

        builder.HasIndex(p => p.Code).IsUnique();
    }
}
