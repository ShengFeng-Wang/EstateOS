using EstateOS.Application.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _service;

    public ReportsController(ReportService service)
    {
        _service = service;
    }

    [HttpGet("occupancy")]
    public async Task<ActionResult<OccupancyReportDto>> Occupancy(CancellationToken ct)
        => Ok(await _service.GetOccupancyReportAsync(ct));

    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueReportDto>> Revenue([FromQuery] int months, CancellationToken ct)
        => Ok(await _service.GetRevenueReportAsync(months <= 0 ? 6 : months, ct));

    [HttpGet("maintenance")]
    public async Task<ActionResult<MaintenanceReportDto>> Maintenance(CancellationToken ct)
        => Ok(await _service.GetMaintenanceReportAsync(ct));
}
