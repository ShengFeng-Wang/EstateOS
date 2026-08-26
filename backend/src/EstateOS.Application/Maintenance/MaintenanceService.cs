using EstateOS.Application.Common;
using EstateOS.Domain;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Maintenance;

public class MaintenanceService
{
    private readonly IAppDbContext _db;

    public MaintenanceService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<MaintenanceRequestDto>> ListAsync(MaintenanceListQuery query, CancellationToken ct = default)
    {
        var q = _db.MaintenanceRequests.AsNoTracking().Include(m => m.Property).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(m => m.Title.Contains(term) || m.Property.Name.Contains(term) || m.Property.Code.Contains(term));
        }

        if (query.PropertyId is not null) q = q.Where(m => m.PropertyId == query.PropertyId);
        if (query.Status is not null) q = q.Where(m => m.Status == query.Status);
        if (query.Priority is not null) q = q.Where(m => m.Priority == query.Priority);
        if (query.AssigneeId is not null) q = q.Where(m => m.AssigneeId == query.AssigneeId);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(m => m.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(m => ToDto(m))
            .ToListAsync(ct);

        return new PagedResult<MaintenanceRequestDto> { Items = items, Total = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<MaintenanceRequestDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var request = await _db.MaintenanceRequests.AsNoTracking().Include(m => m.Property)
            .SingleOrDefaultAsync(m => m.Id == id, ct)
            ?? throw new NotFoundException(nameof(MaintenanceRequest), id);
        return ToDto(request);
    }

    public async Task<MaintenanceRequestDto> CreateAsync(CreateMaintenanceRequest request, CancellationToken ct = default)
    {
        var property = await _db.Properties.AsNoTracking().SingleOrDefaultAsync(p => p.Id == request.PropertyId, ct)
            ?? throw new NotFoundException(nameof(Property), request.PropertyId);

        ValidateCompletedState(request.Status, request.Status == MaintenanceStatus.Completed ? DateTime.UtcNow : null);

        var now = DateTime.UtcNow;
        var entity = new MaintenanceRequest
        {
            Id = Guid.NewGuid(),
            PropertyId = request.PropertyId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = request.Status,
            AssigneeId = request.AssigneeId,
            CreatedAt = now,
            UpdatedAt = now,
            CompletedAt = request.Status == MaintenanceStatus.Completed ? now : null
        };

        _db.MaintenanceRequests.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity, property.Code, property.Name);
    }

    public async Task<MaintenanceRequestDto> UpdateAsync(Guid id, UpdateMaintenanceRequest request, CancellationToken ct = default)
    {
        ValidateCompletedState(request.Status, request.CompletedAt);

        var entity = await _db.MaintenanceRequests.Include(m => m.Property)
            .SingleOrDefaultAsync(m => m.Id == id, ct)
            ?? throw new NotFoundException(nameof(MaintenanceRequest), id);

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Priority = request.Priority;
        entity.Status = request.Status;
        entity.AssigneeId = request.AssigneeId;
        entity.CompletedAt = request.Status == MaintenanceStatus.Completed
            ? request.CompletedAt ?? DateTime.UtcNow
            : null;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    private static void ValidateCompletedState(MaintenanceStatus status, DateTime? completedAt)
    {
        if (status == MaintenanceStatus.Completed && completedAt is null)
        {
            throw new ValidationException("A completed maintenance request requires completedAt.");
        }
    }

    private static MaintenanceRequestDto ToDto(MaintenanceRequest m) =>
        ToDto(m, m.Property.Code, m.Property.Name);

    private static MaintenanceRequestDto ToDto(MaintenanceRequest m, string propertyCode, string propertyName) => new(
        m.Id, m.PropertyId, m.Title, m.Description, m.Priority, m.Status, m.AssigneeId,
        m.CreatedAt, m.UpdatedAt, m.CompletedAt, propertyCode, propertyName);
}
