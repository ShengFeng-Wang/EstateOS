namespace EstateOS.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Contract Contract { get; set; } = null!;
    public Property Property { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
