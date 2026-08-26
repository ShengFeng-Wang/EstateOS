using EstateOS.Application.Common;
using EstateOS.Domain;
using EstateOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Payments;

public class PaymentService
{
    private readonly IAppDbContext _db;

    public PaymentService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PaymentDto>> ListAsync(PaymentListQuery query, CancellationToken ct = default)
    {
        var q = _db.Payments.AsNoTracking().Include(p => p.Property).Include(p => p.Tenant).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(p => p.Property.Name.Contains(term) || p.Property.Code.Contains(term) || p.Tenant.Name.Contains(term));
        }

        if (query.PropertyId is not null) q = q.Where(p => p.PropertyId == query.PropertyId);
        if (query.TenantId is not null) q = q.Where(p => p.TenantId == query.TenantId);
        if (query.ContractId is not null) q = q.Where(p => p.ContractId == query.ContractId);
        if (query.Status is not null) q = q.Where(p => p.Status == query.Status);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.DueDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => ToDto(p))
            .ToListAsync(ct);

        return new PagedResult<PaymentDto> { Items = items, Total = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<PaymentDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var payment = await _db.Payments.AsNoTracking().Include(p => p.Property).Include(p => p.Tenant)
            .SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Payment), id);
        return ToDto(payment);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentRequest request, CancellationToken ct = default)
    {
        ValidatePaidState(request.Status, request.PaidAt);

        var contract = await _db.Contracts.AsNoTracking().Include(c => c.Property).Include(c => c.Tenant)
            .SingleOrDefaultAsync(c => c.Id == request.ContractId, ct)
            ?? throw new NotFoundException(nameof(Contract), request.ContractId);

        var now = DateTime.UtcNow;
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            ContractId = contract.Id,
            PropertyId = contract.PropertyId,
            TenantId = contract.TenantId,
            Amount = request.Amount,
            DueDate = request.DueDate,
            PaidAt = request.PaidAt,
            PaymentMethod = request.PaymentMethod,
            Status = request.Status,
            Notes = request.Notes,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);
        return ToDto(payment, contract.Property.Code, contract.Property.Name, contract.Tenant.Name);
    }

    public async Task<PaymentDto> UpdateAsync(Guid id, UpdatePaymentRequest request, CancellationToken ct = default)
    {
        ValidatePaidState(request.Status, request.PaidAt);

        var payment = await _db.Payments.Include(p => p.Property).Include(p => p.Tenant)
            .SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Payment), id);

        payment.Amount = request.Amount;
        payment.DueDate = request.DueDate;
        payment.Status = request.Status;
        payment.PaidAt = request.PaidAt;
        payment.PaymentMethod = request.PaymentMethod;
        payment.Notes = request.Notes;
        payment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(payment);
    }

    private static void ValidatePaidState(PaymentStatus status, DateTime? paidAt)
    {
        if (status == PaymentStatus.Paid && paidAt is null)
        {
            throw new ValidationException("A paid payment requires paidAt.");
        }
    }

    private static PaymentDto ToDto(Payment p) =>
        ToDto(p, p.Property.Code, p.Property.Name, p.Tenant.Name);

    private static PaymentDto ToDto(Payment p, string propertyCode, string propertyName, string tenantName) => new(
        p.Id, p.ContractId, p.PropertyId, p.TenantId, p.Amount, p.DueDate, p.PaidAt,
        p.PaymentMethod, p.Status, p.Notes, p.CreatedAt, p.UpdatedAt, propertyCode, propertyName, tenantName);
}
