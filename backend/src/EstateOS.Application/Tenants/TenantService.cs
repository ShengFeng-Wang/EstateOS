using EstateOS.Application.Common;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Tenants;

public class TenantService
{
    private readonly IAppDbContext _db;

    public TenantService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<TenantDto>> ListAsync(TenantListQuery query, CancellationToken ct = default)
    {
        var q = _db.Tenants.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(t => t.Name.Contains(term) || t.Phone.Contains(term) || t.Email.Contains(term));
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(t => t.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => ToDto(t))
            .ToListAsync(ct);

        return new PagedResult<TenantDto> { Items = items, Total = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<TenantDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var tenant = await _db.Tenants.AsNoTracking().SingleOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new NotFoundException(nameof(Tenant), id);
        return ToDto(tenant);
    }

    public async Task<TenantDto> CreateAsync(CreateTenantRequest request, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            IdentityReference = request.IdentityReference,
            EmergencyContact = request.EmergencyContact,
            Notes = request.Notes,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(ct);
        return ToDto(tenant);
    }

    public async Task<TenantDto> UpdateAsync(Guid id, UpdateTenantRequest request, CancellationToken ct = default)
    {
        var tenant = await _db.Tenants.SingleOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new NotFoundException(nameof(Tenant), id);

        tenant.Name = request.Name;
        tenant.Phone = request.Phone;
        tenant.Email = request.Email;
        tenant.IdentityReference = request.IdentityReference;
        tenant.EmergencyContact = request.EmergencyContact;
        tenant.Notes = request.Notes;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(tenant);
    }

    private static TenantDto ToDto(Tenant t) => new(
        t.Id, t.Name, t.Phone, t.Email, t.IdentityReference, t.EmergencyContact, t.Notes, t.CreatedAt, t.UpdatedAt);
}
