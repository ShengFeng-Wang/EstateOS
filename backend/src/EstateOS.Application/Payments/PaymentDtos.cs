using EstateOS.Domain;

namespace EstateOS.Application.Payments;

public record PaymentDto(
    Guid Id, Guid ContractId, Guid PropertyId, Guid TenantId, decimal Amount,
    DateOnly DueDate, DateTime? PaidAt, string? PaymentMethod, PaymentStatus Status,
    string? Notes, DateTime CreatedAt, DateTime UpdatedAt);

public record CreatePaymentRequest(
    Guid ContractId, decimal Amount, DateOnly DueDate, PaymentStatus Status,
    DateTime? PaidAt, string? PaymentMethod, string? Notes);

public record UpdatePaymentRequest(
    decimal Amount, DateOnly DueDate, PaymentStatus Status, DateTime? PaidAt,
    string? PaymentMethod, string? Notes);

public record PaymentListQuery
{
    public Guid? PropertyId { get; init; }
    public Guid? TenantId { get; init; }
    public Guid? ContractId { get; init; }
    public PaymentStatus? Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
