using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Common;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Property> Properties { get; }
    DbSet<Tenant> Tenants { get; }
    DbSet<Contract> Contracts { get; }
    DbSet<Payment> Payments { get; }
    DbSet<MaintenanceRequest> MaintenanceRequests { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
