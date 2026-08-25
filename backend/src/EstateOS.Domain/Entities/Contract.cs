namespace EstateOS.Domain.Entities;

public class Contract
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Draft;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Property Property { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
