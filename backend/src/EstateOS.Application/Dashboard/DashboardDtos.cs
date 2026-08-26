using EstateOS.Domain;

namespace EstateOS.Application.Dashboard;

public record DashboardSummaryDto(
    int PropertyCount,
    int OccupiedCount,
    int VacantCount,
    int MaintenanceCount,
    int ArchivedCount,
    double OccupancyRate,
    decimal MonthlyRevenue,
    int OverduePaymentCount,
    decimal OverdueAmount,
    int ExpiringSoonContractCount,
    int OpenMaintenanceCount,
    IReadOnlyList<PropertyTypeCountDto> TypeBreakdown);

public record PropertyTypeCountDto(PropertyType Type, int Count);

public record RevenueTrendPointDto(int Year, int Month, decimal Revenue);

public record DashboardTrendsDto(IReadOnlyList<RevenueTrendPointDto> Revenue);
