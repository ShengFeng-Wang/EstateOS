using EstateOS.Application.Common;
using EstateOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Dashboard;

public class DashboardService
{
    private readonly IAppDbContext _db;

    public DashboardService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var activeProperties = _db.Properties.AsNoTracking().Where(p => p.ArchivedAt == null);

        var propertyCount = await activeProperties.CountAsync(ct);
        var occupiedCount = await activeProperties.CountAsync(p => p.Status == PropertyStatus.Occupied, ct);
        var vacantCount = await activeProperties.CountAsync(p => p.Status == PropertyStatus.Vacant, ct);
        var maintenanceCount = await activeProperties.CountAsync(p => p.Status == PropertyStatus.Maintenance, ct);
        var archivedCount = await _db.Properties.AsNoTracking().CountAsync(p => p.ArchivedAt != null, ct);
        var occupancyRate = propertyCount == 0 ? 0 : Math.Round((double)occupiedCount / propertyCount * 100, 1);

        var typeBreakdown = await activeProperties
            .GroupBy(p => p.Type)
            .Select(g => new PropertyTypeCountDto(g.Key, g.Count()))
            .ToListAsync(ct);

        var monthlyRevenue = await activeProperties
            .Where(p => p.Status == PropertyStatus.Occupied)
            .SumAsync(p => (decimal?)p.MonthlyRent, ct) ?? 0m;

        var overduePayments = _db.Payments.AsNoTracking().Where(p => p.Status == PaymentStatus.Overdue);
        var overduePaymentCount = await overduePayments.CountAsync(ct);
        var overdueAmount = await overduePayments.SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var expiringSoonContractCount = await _db.Contracts.AsNoTracking()
            .CountAsync(c => c.Status == ContractStatus.ExpiringSoon, ct);

        var openMaintenanceCount = await _db.MaintenanceRequests.AsNoTracking()
            .CountAsync(m => m.Status == MaintenanceStatus.Open || m.Status == MaintenanceStatus.InProgress, ct);

        return new DashboardSummaryDto(
            propertyCount, occupiedCount, vacantCount, maintenanceCount, archivedCount, occupancyRate, monthlyRevenue,
            overduePaymentCount, overdueAmount, expiringSoonContractCount, openMaintenanceCount, typeBreakdown);
    }

    public async Task<DashboardTrendsDto> GetTrendsAsync(int months = 6, CancellationToken ct = default)
    {
        var since = DateTime.UtcNow.AddMonths(-(months - 1));
        var sinceMonthStart = new DateTime(since.Year, since.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var raw = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Paid && p.PaidAt != null && p.PaidAt >= sinceMonthStart)
            .GroupBy(p => new { p.PaidAt!.Value.Year, p.PaidAt!.Value.Month })
            .Select(g => new RevenueTrendPointDto(g.Key.Year, g.Key.Month, g.Sum(p => p.Amount)))
            .ToListAsync(ct);

        var result = new List<RevenueTrendPointDto>();
        for (var i = 0; i < months; i++)
        {
            var point = sinceMonthStart.AddMonths(i);
            var match = raw.FirstOrDefault(r => r.Year == point.Year && r.Month == point.Month);
            result.Add(match ?? new RevenueTrendPointDto(point.Year, point.Month, 0m));
        }

        return new DashboardTrendsDto(result);
    }
}
