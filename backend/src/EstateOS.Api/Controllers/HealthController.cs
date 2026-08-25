using EstateOS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace EstateOS.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });

    [HttpGet("db")]
    public async Task<IActionResult> GetDb()
    {
        var canConnect = await _db.Database.CanConnectAsync();
        return canConnect ? Ok(new { status = "ok", database = "connected" }) : StatusCode(503, new { status = "error", database = "unreachable" });
    }
}
