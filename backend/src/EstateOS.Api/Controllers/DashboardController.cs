using EstateOS.Application.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken ct)
        => Ok(await _service.GetSummaryAsync(ct));

    [HttpGet("trends")]
    public async Task<ActionResult<DashboardTrendsDto>> Trends([FromQuery] int months, CancellationToken ct)
        => Ok(await _service.GetTrendsAsync(months <= 0 ? 6 : months, ct));
}
