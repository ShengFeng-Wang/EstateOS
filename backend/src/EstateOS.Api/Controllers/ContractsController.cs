using EstateOS.Application.Common;
using EstateOS.Application.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/contracts")]
public class ContractsController : ControllerBase
{
    private readonly ContractService _service;

    public ContractsController(ContractService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ContractDto>>> List([FromQuery] ContractListQuery query, CancellationToken ct)
        => Ok(await _service.ListAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContractDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _service.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<ContractDto>> Create(CreateContractRequest request, CancellationToken ct)
    {
        var created = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ContractDto>> Update(Guid id, UpdateContractRequest request, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, request, ct));

    [HttpPost("{id:guid}/terminate")]
    public async Task<ActionResult<ContractDto>> Terminate(Guid id, CancellationToken ct)
        => Ok(await _service.TerminateAsync(id, ct));
}
