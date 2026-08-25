using EstateOS.Application.Common;
using EstateOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Reports;

public class ReportService
{
    private readonly IAppDbContext _db;

    public ReportService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<OccupancyReportDto> GetOccupancyReportAsync(CancellationToken ct = default)
    {
        var properties = _db.Properties.AsNoTracking().Where(p => p.ArchivedAt == null);

        var total = await properties.CountAsync(ct);
        var occupied = await properties.CountAsync(p => p.Status == PropertyStatus.Occupied, ct);
        var vacant = await properties.CountAsync(p => p.Status == PropertyStatus.Vacant, ct);
        var overallRate = total == 0 ? 0 : Math.Round((double)occupied / total * 100, 1);

        var byStatus = await properties
            .GroupBy(p => p.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var byType = await properties
            .GroupBy(p => p.Type)
            .Select(g => new
            {
                Type = g.Key,
                PropertyCount = g.Count(),
                OccupiedCount = g.Count(p => p.Status == PropertyStatus.Occupied)
            })
            .ToListAsync(ct);

        return new OccupancyReportDto(
            total, occupied, vacant, overallRate,
            byStatus.Select(s => new OccupancyByStatusDto(s.Status.ToString(), s.Count)).ToList(),
            byType.Select(t => new OccupancyByTypeDto(
                t.Type.ToString(), t.PropertyCount, t.OccupiedCount,
                t.PropertyCount == 0 ? 0 : Math.Round((double)t.OccupiedCount / t.PropertyCount * 100, 1))).ToList());
    }

    public async Task<RevenueReportDto> GetRevenueReportAsync(int months = 6, CancellationToken ct = default)
    {
        var totalCollected = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Paid).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var totalPending = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Pending).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var totalOverdue = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Overdue).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var since = DateTime.UtcNow.AddMonths(-(months - 1));
        var sinceMonthStart = new DateTime(since.Year, since.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var paidByMonth = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Paid && p.PaidAt != null && p.PaidAt >= sinceMonthStart)
            .GroupBy(p => new { p.PaidAt!.Value.Year, p.PaidAt!.Value.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Amount = g.Sum(p => p.Amount) })
            .ToListAsync(ct);

        var pendingByMonth = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Pending && p.DueDate >= DateOnly.FromDateTime(sinceMonthStart))
            .GroupBy(p => new { p.DueDate.Year, p.DueDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Amount = g.Sum(p => p.Amount) })
            .ToListAsync(ct);

        var overdueByMonth = await _db.Payments.AsNoTracking()
            .Where(p => p.Status == PaymentStatus.Overdue && p.DueDate >= DateOnly.FromDateTime(sinceMonthStart))
            .GroupBy(p => new { p.DueDate.Year, p.DueDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Amount = g.Sum(p => p.Amount) })
            .ToListAsync(ct);

        var byMonth = new List<RevenueByMonthDto>();
        for (var i = 0; i < months; i++)
        {
            var point = sinceMonthStart.AddMonths(i);
            var collected = paidByMonth.FirstOrDefault(x => x.Year == point.Year && x.Month == point.Month)?.Amount ?? 0m;
            var pending = pendingByMonth.FirstOrDefault(x => x.Year == point.Year && x.Month == point.Month)?.Amount ?? 0m;
            var overdue = overdueByMonth.FirstOrDefault(x => x.Year == point.Year && x.Month == point.Month)?.Amount ?? 0m;
            byMonth.Add(new RevenueByMonthDto(point.Year, point.Month, collected, pending, overdue));
        }

        return new RevenueReportDto(totalCollected, totalPending, totalOverdue, byMonth);
    }

    public async Task<MaintenanceReportDto> GetMaintenanceReportAsync(CancellationToken ct = default)
    {
        var requests = _db.MaintenanceRequests.AsNoTracking();

        var open = await requests.CountAsync(m => m.Status == MaintenanceStatus.Open, ct);
        var inProgress = await requests.CountAsync(m => m.Status == MaintenanceStatus.InProgress, ct);
        var completed = await requests.CountAsync(m => m.Status == MaintenanceStatus.Completed, ct);
        var cancelled = await requests.CountAsync(m => m.Status == MaintenanceStatus.Cancelled, ct);

        var byStatus = new[]
        {
            new MaintenanceByStatusDto(MaintenanceStatus.Open.ToString(), open),
            new MaintenanceByStatusDto(MaintenanceStatus.InProgress.ToString(), inProgress),
            new MaintenanceByStatusDto(MaintenanceStatus.Completed.ToString(), completed),
            new MaintenanceByStatusDto(MaintenanceStatus.Cancelled.ToString(), cancelled)
        };

        var byPriority = await requests
            .GroupBy(m => m.Priority)
            .Select(g => new MaintenanceByPriorityDto(g.Key.ToString(), g.Count()))
            .ToListAsync(ct);

        return new MaintenanceReportDto(open, inProgress, completed, cancelled, byStatus, byPriority);
    }
}
