namespace EstateOS.Domain.Entities;

public class MaintenanceRequest
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Open;
    public Guid? AssigneeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public Property Property { get; set; } = null!;
    public User? Assignee { get; set; }
}
