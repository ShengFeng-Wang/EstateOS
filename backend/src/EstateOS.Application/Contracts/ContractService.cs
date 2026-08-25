using EstateOS.Application.Common;
using EstateOS.Domain;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Contracts;

public class ContractService
{
    private readonly IAppDbContext _db;

    public ContractService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ContractDto>> ListAsync(ContractListQuery query, CancellationToken ct = default)
    {
        var q = _db.Contracts.AsNoTracking().AsQueryable();

        if (query.PropertyId is not null) q = q.Where(c => c.PropertyId == query.PropertyId);
        if (query.TenantId is not null) q = q.Where(c => c.TenantId == query.TenantId);
        if (query.Status is not null) q = q.Where(c => c.Status == query.Status);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(c => c.StartDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => ToDto(c))
            .ToListAsync(ct);

        return new PagedResult<ContractDto> { Items = items, Total = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<ContractDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var contract = await _db.Contracts.AsNoTracking().SingleOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Contract), id);
        return ToDto(contract);
    }

    public async Task<ContractDto> CreateAsync(CreateContractRequest request, CancellationToken ct = default)
    {
        ValidateDates(request.StartDate, request.EndDate);

        if (!await _db.Properties.AnyAsync(p => p.Id == request.PropertyId, ct))
        {
            throw new NotFoundException(nameof(Property), request.PropertyId);
        }

        if (!await _db.Tenants.AnyAsync(t => t.Id == request.TenantId, ct))
        {
            throw new NotFoundException(nameof(Tenant), request.TenantId);
        }

        if (request.Status == ContractStatus.Active)
        {
            await EnsureNoOverlappingActiveContractAsync(request.PropertyId, request.StartDate, request.EndDate, null, ct);
        }

        var now = DateTime.UtcNow;
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            PropertyId = request.PropertyId,
            TenantId = request.TenantId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MonthlyRent = request.MonthlyRent,
            Deposit = request.Deposit,
            Status = request.Status,
            Notes = request.Notes,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync(ct);
        return ToDto(contract);
    }

    public async Task<ContractDto> UpdateAsync(Guid id, UpdateContractRequest request, CancellationToken ct = default)
    {
        ValidateDates(request.StartDate, request.EndDate);

        var contract = await _db.Contracts.SingleOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Contract), id);

        if (request.Status == ContractStatus.Active)
        {
            await EnsureNoOverlappingActiveContractAsync(contract.PropertyId, request.StartDate, request.EndDate, contract.Id, ct);
        }

        contract.StartDate = request.StartDate;
        contract.EndDate = request.EndDate;
        contract.MonthlyRent = request.MonthlyRent;
        contract.Deposit = request.Deposit;
        contract.Status = request.Status;
        contract.Notes = request.Notes;
        contract.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(contract);
    }

    public async Task<ContractDto> TerminateAsync(Guid id, CancellationToken ct = default)
    {
        var contract = await _db.Contracts.SingleOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Contract), id);

        if (contract.Status is ContractStatus.Terminated or ContractStatus.Expired)
        {
            throw new ConflictException($"Contract is already {contract.Status}.");
        }

        contract.Status = ContractStatus.Terminated;
        contract.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(contract);
    }

    private static void ValidateDates(DateOnly start, DateOnly end)
    {
        if (end <= start)
        {
            throw new ValidationException("Contract end date must be later than the start date.");
        }
    }

    private async Task EnsureNoOverlappingActiveContractAsync(
        Guid propertyId, DateOnly startDate, DateOnly endDate, Guid? excludeContractId, CancellationToken ct)
    {
        var overlaps = await _db.Contracts.AsNoTracking().AnyAsync(c =>
            c.PropertyId == propertyId &&
            c.Status == ContractStatus.Active &&
            c.Id != excludeContractId &&
            c.StartDate < endDate &&
            c.EndDate > startDate, ct);

        if (overlaps)
        {
            throw new ConflictException("This property already has an overlapping active contract.");
        }
    }

    private static ContractDto ToDto(Contract c) => new(
        c.Id, c.PropertyId, c.TenantId, c.StartDate, c.EndDate, c.MonthlyRent, c.Deposit,
        c.Status, c.Notes, c.CreatedAt, c.UpdatedAt);
}
