using EstateOS.Application.Common;
using EstateOS.Domain;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher passwordHasher, CancellationToken ct = default)
    {
        if (!await db.Users.AnyAsync(ct))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Email = "admin@estateos.dev",
                PasswordHash = passwordHasher.Hash("ChangeMe123!"),
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await db.Properties.AnyAsync(ct))
        {
            var now = DateTime.UtcNow;

            var propertyA = new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-001", Name = "Harbor View Residence 3F",
                Address = "No. 88, Xinyi Rd", City = "Taipei", District = "Xinyi",
                Type = PropertyType.Apartment, Status = PropertyStatus.Occupied,
                MonthlyRent = 45000m, Size = 32.5m, Rooms = 2, Floor = 3,
                Description = "Corner unit with harbor-facing balcony.",
                CreatedAt = now, UpdatedAt = now
            };

            var propertyB = new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-002", Name = "Central Studio 12F",
                Address = "No. 12, Zhongxiao E. Rd", City = "Taipei", District = "Da'an",
                Type = PropertyType.Studio, Status = PropertyStatus.Vacant,
                MonthlyRent = 28000m, Size = 18m, Rooms = 1, Floor = 12,
                Description = "Compact studio near MRT.",
                CreatedAt = now, UpdatedAt = now
            };

            var propertyC = new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-003", Name = "Riverside Office Suite 5F",
                Address = "No. 5, Bade Rd", City = "Taipei", District = "Songshan",
                Type = PropertyType.Office, Status = PropertyStatus.Maintenance,
                MonthlyRent = 68000m, Size = 55m, Rooms = 0, Floor = 5,
                Description = "Open-plan office suite, HVAC servicing in progress.",
                CreatedAt = now, UpdatedAt = now
            };

            db.Properties.AddRange(propertyA, propertyB, propertyC);

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(), Name = "Wen-Chi Lin", Phone = "0912-345-678",
                Email = "wenchi.lin@example.com", EmergencyContact = "0987-654-321",
                CreatedAt = now, UpdatedAt = now
            };
            db.Tenants.Add(tenant);

            var contract = new Contract
            {
                Id = Guid.NewGuid(), PropertyId = propertyA.Id, TenantId = tenant.Id,
                StartDate = DateOnly.FromDateTime(now).AddMonths(-3),
                EndDate = DateOnly.FromDateTime(now).AddMonths(9),
                MonthlyRent = propertyA.MonthlyRent, Deposit = propertyA.MonthlyRent * 2,
                Status = ContractStatus.Active, CreatedAt = now, UpdatedAt = now
            };
            db.Contracts.Add(contract);

            db.Payments.Add(new Payment
            {
                Id = Guid.NewGuid(), ContractId = contract.Id, PropertyId = propertyA.Id, TenantId = tenant.Id,
                Amount = propertyA.MonthlyRent, DueDate = DateOnly.FromDateTime(now).AddDays(-5),
                PaidAt = now.AddDays(-6), PaymentMethod = "BankTransfer", Status = PaymentStatus.Paid,
                CreatedAt = now, UpdatedAt = now
            });

            db.Payments.Add(new Payment
            {
                Id = Guid.NewGuid(), ContractId = contract.Id, PropertyId = propertyA.Id, TenantId = tenant.Id,
                Amount = propertyA.MonthlyRent, DueDate = DateOnly.FromDateTime(now).AddDays(25),
                Status = PaymentStatus.Pending, CreatedAt = now, UpdatedAt = now
            });

            db.MaintenanceRequests.Add(new MaintenanceRequest
            {
                Id = Guid.NewGuid(), PropertyId = propertyC.Id, Title = "HVAC servicing",
                Description = "Annual maintenance for the central air handling unit.",
                Priority = MaintenancePriority.Medium, Status = MaintenanceStatus.InProgress,
                CreatedAt = now, UpdatedAt = now
            });
        }

        await db.SaveChangesAsync(ct);
    }
}
