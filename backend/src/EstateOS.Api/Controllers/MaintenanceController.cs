using EstateOS.Application.Common;
using EstateOS.Application.Maintenance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly MaintenanceService _service;

    public MaintenanceController(MaintenanceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<MaintenanceRequestDto>>> List([FromQuery] MaintenanceListQuery query, CancellationToken ct)
        => Ok(await _service.ListAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MaintenanceRequestDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _service.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<MaintenanceRequestDto>> Create(CreateMaintenanceRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MaintenanceRequestDto>> Update(Guid id, UpdateMaintenanceRequest request, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, request, ct));
}
