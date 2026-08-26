using EstateOS.Domain;

namespace EstateOS.Application.Maintenance;

public record MaintenanceRequestDto(
    Guid Id, Guid PropertyId, string Title, string Description,
    MaintenancePriority Priority, MaintenanceStatus Status, Guid? AssigneeId,
    DateTime CreatedAt, DateTime UpdatedAt, DateTime? CompletedAt,
    string PropertyCode, string PropertyName);

public record CreateMaintenanceRequest(
    Guid PropertyId, string Title, string Description, MaintenancePriority Priority,
    MaintenanceStatus Status, Guid? AssigneeId);

public record UpdateMaintenanceRequest(
    string Title, string Description, MaintenancePriority Priority,
    MaintenanceStatus Status, Guid? AssigneeId, DateTime? CompletedAt);

public record MaintenanceListQuery
{
    public string? Search { get; init; }
    public Guid? PropertyId { get; init; }
    public MaintenanceStatus? Status { get; init; }
    public MaintenancePriority? Priority { get; init; }
    public Guid? AssigneeId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
