using EstateOS.Application.Common;
using EstateOS.Domain;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Infrastructure.Persistence;

public static class DbSeeder
{
    // Bade is intentionally excluded here — its 5 properties are real named buildings on
    // real roads (SeedRealBadeProperties below), not procedurally generated like the rest.
    private static readonly (string City, string District)[] Locations =
    [
        ("Taipei", "Xinyi"), ("Taipei", "Da'an"), ("Taipei", "Songshan"),
        ("Taipei", "Neihu"), ("Taipei", "Nangang"), ("New Taipei", "Banqiao"),
        ("New Taipei", "Linkou"), ("Taoyuan", "Zhongli"),
    ];

    private static readonly (PropertyType Type, decimal MinRent, decimal MaxRent, decimal MinSize, decimal MaxSize, int MinRooms, int MaxRooms)[] Archetypes =
    [
        (PropertyType.Apartment, 32000m, 58000m, 24m, 42m, 2, 3),
        (PropertyType.Studio, 20000m, 34000m, 14m, 22m, 1, 1),
        (PropertyType.Townhouse, 42000m, 72000m, 34m, 56m, 3, 4),
        (PropertyType.Office, 55000m, 140000m, 45m, 90m, 0, 0),
        (PropertyType.Retail, 38000m, 96000m, 30m, 70m, 0, 0),
    ];

    private static readonly string[] StreetNames =
    [
        "Zhongxiao Rd", "Bade Rd", "Fuxing S. Rd", "Minsheng E. Rd", "Songjiang Rd",
        "Civic Blvd", "Nanjing E. Rd", "Heping E. Rd", "Chang'an E. Rd", "Jianguo N. Rd",
    ];

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

            SeedRealBadeProperties(db, now);
            SeedPortfolio(db, now, count: 57, startIndex: 9);
        }

        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Five real, named buildings in Taoyuan's Bade Redevelopment Zone (八德擴大重劃區), used
    /// by the Real Map feature per direct product request — the map is scoped to this one zone
    /// and asked for real buildings at real addresses. Names/roads verified via web search
    /// (community.houseprice.tw's Bade community listing); exact GPS is not surveyed per
    /// building — see frontend/src/features/real-map/realBadeBuildings.ts for the approximate
    /// coordinates used and known-limitations.md for the caveat. Rents are not scraped from any
    /// live listing (per the product owner's explicit choice to avoid that) — they're set to
    /// reflect the relative price tier these buildings' real sale-price-per-ping data implies
    /// (newer/premium builds priced higher, the older 成屋 building priced lower), scaled into
    /// this app's existing Apartment/Townhouse rent bands for consistency with the rest of the
    /// seeded portfolio, and cross-checked against 八德地政事務所's cited per-ping rent averages
    /// for the district. These are estimates, not a specific unit's actual current asking rent.
    /// </summary>
    private static void SeedRealBadeProperties(AppDbContext db, DateTime now)
    {
        var properties = new[]
        {
            new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-004", Name = "Chengzhong Dazi",
                Address = "Zhongzheng 1st Rd", City = "Taoyuan", District = "Bade",
                Type = PropertyType.Apartment, Status = PropertyStatus.Occupied,
                MonthlyRent = 52000m, Size = 38m, Rooms = 2, Floor = 9,
                Description = "New-build premium residence in the Bade Redevelopment Zone.",
                CreatedAt = now, UpdatedAt = now
            },
            new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-005", Name = "Heyuan Shouzhan",
                Address = "Zhongzheng Rd", City = "Taoyuan", District = "Bade",
                Type = PropertyType.Townhouse, Status = PropertyStatus.Occupied,
                MonthlyRent = 58000m, Size = 45m, Rooms = 3, Floor = 4,
                Description = "Townhouse-style unit near the redevelopment zone's commercial corridor.",
                CreatedAt = now, UpdatedAt = now
            },
            new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-006", Name = "Guanyi Shengeng 13",
                Address = "Guangxing Rd", City = "Taoyuan", District = "Bade",
                Type = PropertyType.Apartment, Status = PropertyStatus.Vacant,
                MonthlyRent = 46000m, Size = 34m, Rooms = 2, Floor = 7,
                Description = "Mid-rise apartment on Guangxing Road.",
                CreatedAt = now, UpdatedAt = now
            },
            new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-007", Name = "Lihpao Youth Era",
                Address = "Fengde Rd", City = "Taoyuan", District = "Bade",
                Type = PropertyType.Apartment, Status = PropertyStatus.Occupied,
                MonthlyRent = 38000m, Size = 28m, Rooms = 1, Floor = 5,
                Description = "Established residence on Fengde Road.",
                CreatedAt = now, UpdatedAt = now
            },
            new Property
            {
                Id = Guid.NewGuid(), Code = "PPT-008", Name = "Deyi Yudi",
                Address = "Qietong Rd", City = "Taoyuan", District = "Bade",
                Type = PropertyType.Townhouse, Status = PropertyStatus.Maintenance,
                MonthlyRent = 50000m, Size = 40m, Rooms = 3, Floor = 3,
                Description = "Townhouse on Qietong Road, undergoing scheduled upkeep.",
                CreatedAt = now, UpdatedAt = now
            },
        };

        db.Properties.AddRange(properties);
    }

    // Fixed-seed generator for a demo-scale portfolio (Digital Twin needs 50-200 properties
    // to read as a city; see docs/estateos/claude-threejs-implementation-spec.md).
    private static void SeedPortfolio(AppDbContext db, DateTime now, int count, int startIndex)
    {
        var rng = new Random(20260825);
        var contractPropertiesForRevenue = new List<Property>();

        for (var i = 0; i < count; i++)
        {
            var index = startIndex + i;
            var (type, minRent, maxRent, minSize, maxSize, minRooms, maxRooms) = Archetypes[rng.Next(Archetypes.Length)];
            var (city, district) = Locations[rng.Next(Locations.Length)];
            var street = StreetNames[rng.Next(StreetNames.Length)];

            var status = rng.NextDouble() switch
            {
                < 0.68 => PropertyStatus.Occupied,
                < 0.88 => PropertyStatus.Vacant,
                _ => PropertyStatus.Maintenance,
            };

            var rent = Math.Round((minRent + (decimal)rng.NextDouble() * (maxRent - minRent)) / 100m) * 100m;
            var size = Math.Round(minSize + (decimal)rng.NextDouble() * (maxSize - minSize), 1);
            var rooms = minRooms == maxRooms ? minRooms : rng.Next(minRooms, maxRooms + 1);
            var floor = rng.Next(1, 22);

            var property = new Property
            {
                Id = Guid.NewGuid(),
                Code = $"PPT-{index:000}",
                Name = $"{district} {type} {floor}F",
                Address = $"No. {rng.Next(1, 300)}, {street}",
                City = city,
                District = district,
                Type = type,
                Status = status,
                MonthlyRent = rent,
                Size = size,
                Rooms = rooms,
                Floor = floor,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Properties.Add(property);

            if (status == PropertyStatus.Occupied)
            {
                contractPropertiesForRevenue.Add(property);
            }
        }

        // Give a subset of occupied properties active contracts + payment history so
        // dashboard/reports/digital-twin revenue and contract-signal views have real depth.
        var tenantNames = new[]
        {
            "Chen Yu-Ting", "Huang Chia-Hao", "Lin Pei-Chen", "Wu Zhi-Wei", "Yang Mei-Ling",
            "Kao Jun-Han", "Chang Hsin-Yi", "Liu Chun-Yu", "Tsai Wei-Chun", "Hsu Yi-Fan",
            "Wang Shu-Fen", "Cheng Kai-Wen",
        };

        for (var i = 0; i < Math.Min(contractPropertiesForRevenue.Count, tenantNames.Length); i++)
        {
            var property = contractPropertiesForRevenue[i];
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = tenantNames[i],
                Phone = $"09{rng.Next(10, 99)}-{rng.Next(100, 999)}-{rng.Next(100, 999)}",
                Email = $"tenant{i + 1}@example.com",
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Tenants.Add(tenant);

            var startMonthsAgo = rng.Next(1, 10);
            var endMonthsAhead = rng.Next(1, 12);
            var status = endMonthsAhead <= 2 ? ContractStatus.ExpiringSoon : ContractStatus.Active;

            var contract = new Contract
            {
                Id = Guid.NewGuid(),
                PropertyId = property.Id,
                TenantId = tenant.Id,
                StartDate = DateOnly.FromDateTime(now).AddMonths(-startMonthsAgo),
                EndDate = DateOnly.FromDateTime(now).AddMonths(endMonthsAhead),
                MonthlyRent = property.MonthlyRent,
                Deposit = property.MonthlyRent * 2,
                Status = status,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Contracts.Add(contract);

            var paymentStatus = rng.NextDouble() switch
            {
                < 0.8 => PaymentStatus.Paid,
                < 0.92 => PaymentStatus.Pending,
                _ => PaymentStatus.Overdue,
            };

            db.Payments.Add(new Payment
            {
                Id = Guid.NewGuid(),
                ContractId = contract.Id,
                PropertyId = property.Id,
                TenantId = tenant.Id,
                Amount = property.MonthlyRent,
                DueDate = DateOnly.FromDateTime(now).AddDays(rng.Next(-15, 15)),
                PaidAt = paymentStatus == PaymentStatus.Paid ? now.AddDays(-rng.Next(1, 10)) : null,
                PaymentMethod = paymentStatus == PaymentStatus.Paid ? "BankTransfer" : null,
                Status = paymentStatus,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }
}
