using EstateOS.Application.Common;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Properties;

public class PropertyService
{
    private readonly IAppDbContext _db;

    public PropertyService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PropertyDto>> ListAsync(PropertyListQuery query, CancellationToken ct = default)
    {
        var q = _db.Properties.AsNoTracking().AsQueryable();

        if (!query.IncludeArchived)
        {
            q = q.Where(p => p.ArchivedAt == null);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(p => p.Name.Contains(term) || p.Code.Contains(term) || p.Address.Contains(term));
        }

        if (query.Type is not null) q = q.Where(p => p.Type == query.Type);
        if (query.Status is not null) q = q.Where(p => p.Status == query.Status);
        if (!string.IsNullOrWhiteSpace(query.City)) q = q.Where(p => p.City == query.City);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(p => p.Code)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => ToDto(p))
            .ToListAsync(ct);

        return new PagedResult<PropertyDto> { Items = items, Total = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<PropertyDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _db.Properties.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Property), id);
        return ToDto(property);
    }

    public async Task<PropertyDto> CreateAsync(CreatePropertyRequest request, CancellationToken ct = default)
    {
        if (await _db.Properties.AnyAsync(p => p.Code == request.Code, ct))
        {
            throw new ConflictException($"A property with code '{request.Code}' already exists.");
        }

        var now = DateTime.UtcNow;
        var property = new Property
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Address = request.Address,
            City = request.City,
            District = request.District,
            Type = request.Type,
            Status = request.Status,
            MonthlyRent = request.MonthlyRent,
            Size = request.Size,
            Rooms = request.Rooms,
            Floor = request.Floor,
            Description = request.Description,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Properties.Add(property);
        await _db.SaveChangesAsync(ct);
        return ToDto(property);
    }

    public async Task<PropertyDto> UpdateAsync(Guid id, UpdatePropertyRequest request, CancellationToken ct = default)
    {
        var property = await _db.Properties.SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Property), id);

        property.Name = request.Name;
        property.Address = request.Address;
        property.City = request.City;
        property.District = request.District;
        property.Type = request.Type;
        property.Status = request.Status;
        property.MonthlyRent = request.MonthlyRent;
        property.Size = request.Size;
        property.Rooms = request.Rooms;
        property.Floor = request.Floor;
        property.Description = request.Description;
        property.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(property);
    }

    public async Task ArchiveAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _db.Properties.SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Property), id);

        property.Status = Domain.PropertyStatus.Archived;
        property.ArchivedAt = DateTime.UtcNow;
        property.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    private static PropertyDto ToDto(Property p) => new(
        p.Id, p.Code, p.Name, p.Address, p.City, p.District, p.Type, p.Status,
        p.MonthlyRent, p.Size, p.Rooms, p.Floor, p.Description, p.CreatedAt, p.UpdatedAt, p.ArchivedAt);
}
