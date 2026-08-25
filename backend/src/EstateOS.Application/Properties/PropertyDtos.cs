using EstateOS.Domain;

namespace EstateOS.Application.Properties;

public record PropertyDto(
    Guid Id, string Code, string Name, string Address, string City, string District,
    PropertyType Type, PropertyStatus Status, decimal MonthlyRent, decimal Size,
    int Rooms, int Floor, string? Description,
    DateTime CreatedAt, DateTime UpdatedAt, DateTime? ArchivedAt);

public record CreatePropertyRequest(
    string Code, string Name, string Address, string City, string District,
    PropertyType Type, PropertyStatus Status, decimal MonthlyRent, decimal Size,
    int Rooms, int Floor, string? Description);

public record UpdatePropertyRequest(
    string Name, string Address, string City, string District,
    PropertyType Type, PropertyStatus Status, decimal MonthlyRent, decimal Size,
    int Rooms, int Floor, string? Description);

public record PropertyListQuery
{
    public string? Search { get; init; }
    public PropertyType? Type { get; init; }
    public PropertyStatus? Status { get; init; }
    public string? City { get; init; }
    public bool IncludeArchived { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
