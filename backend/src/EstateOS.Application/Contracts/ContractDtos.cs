using EstateOS.Domain;

namespace EstateOS.Application.Contracts;

public record ContractDto(
    Guid Id, Guid PropertyId, Guid TenantId, DateOnly StartDate, DateOnly EndDate,
    decimal MonthlyRent, decimal Deposit, ContractStatus Status, string? Notes,
    DateTime CreatedAt, DateTime UpdatedAt, string PropertyCode, string PropertyName, string TenantName);

public record CreateContractRequest(
    Guid PropertyId, Guid TenantId, DateOnly StartDate, DateOnly EndDate,
    decimal MonthlyRent, decimal Deposit, ContractStatus Status, string? Notes);

public record UpdateContractRequest(
    DateOnly StartDate, DateOnly EndDate, decimal MonthlyRent, decimal Deposit,
    ContractStatus Status, string? Notes);

public record ContractListQuery
{
    public string? Search { get; init; }
    public Guid? PropertyId { get; init; }
    public Guid? TenantId { get; init; }
    public ContractStatus? Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
