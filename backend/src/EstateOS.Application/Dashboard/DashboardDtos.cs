namespace EstateOS.Application.Dashboard;

public record DashboardSummaryDto(
    int PropertyCount,
    int OccupiedCount,
    int VacantCount,
    double OccupancyRate,
    decimal MonthlyRevenue,
    int OverduePaymentCount,
    decimal OverdueAmount,
    int ExpiringSoonContractCount,
    int OpenMaintenanceCount);

public record RevenueTrendPointDto(int Year, int Month, decimal Revenue);

public record DashboardTrendsDto(IReadOnlyList<RevenueTrendPointDto> Revenue);
