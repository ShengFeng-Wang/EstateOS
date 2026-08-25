namespace EstateOS.Application.Reports;

public record OccupancyByStatusDto(string Status, int Count);
public record OccupancyByTypeDto(string Type, int PropertyCount, int OccupiedCount, double OccupancyRate);
public record OccupancyReportDto(
    int TotalProperties, int OccupiedCount, int VacantCount, double OverallOccupancyRate,
    IReadOnlyList<OccupancyByStatusDto> ByStatus, IReadOnlyList<OccupancyByTypeDto> ByType);

public record RevenueByMonthDto(int Year, int Month, decimal Collected, decimal Pending, decimal Overdue);
public record RevenueReportDto(
    decimal TotalCollected, decimal TotalPending, decimal TotalOverdue,
    IReadOnlyList<RevenueByMonthDto> ByMonth);

public record MaintenanceByStatusDto(string Status, int Count);
public record MaintenanceByPriorityDto(string Priority, int Count);
public record MaintenanceReportDto(
    int OpenCount, int InProgressCount, int CompletedCount, int CancelledCount,
    IReadOnlyList<MaintenanceByStatusDto> ByStatus, IReadOnlyList<MaintenanceByPriorityDto> ByPriority);
