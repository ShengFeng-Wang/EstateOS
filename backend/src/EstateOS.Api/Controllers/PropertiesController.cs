using EstateOS.Application.Common;
using EstateOS.Application.Properties;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly PropertyService _service;

    public PropertiesController(PropertyService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PropertyDto>>> List([FromQuery] PropertyListQuery query, CancellationToken ct)
    {
        var result = await _service.ListAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PropertyDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _service.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<PropertyDto>> Create(CreatePropertyRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PropertyDto>> Update(Guid id, UpdatePropertyRequest request, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, request, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        await _service.ArchiveAsync(id, ct);
        return NoContent();
    }
}
