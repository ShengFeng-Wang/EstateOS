namespace EstateOS.Application.Tenants;

public record TenantDto(
    Guid Id, string Name, string Phone, string Email, string? IdentityReference,
    string? EmergencyContact, string? Notes, DateTime CreatedAt, DateTime UpdatedAt);

public record CreateTenantRequest(
    string Name, string Phone, string Email, string? IdentityReference,
    string? EmergencyContact, string? Notes);

public record UpdateTenantRequest(
    string Name, string Phone, string Email, string? IdentityReference,
    string? EmergencyContact, string? Notes);

public record TenantListQuery
{
    public string? Search { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
