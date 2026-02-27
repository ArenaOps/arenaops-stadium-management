using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ArenaOps.CoreService.Application.Interfaces;

namespace ArenaOps.CoreService.API.Controllers;

/// <summary>
/// Admin endpoints — restricted to Admin role only.
/// 
/// Routes per API docs (04-Api-Documentation.md, Section J):
///   GET  /api/admin/stadiums              → Admin → List stadiums (pending approval)
///   POST /api/admin/stadiums/{id}/approve  → Admin → Approve stadium
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// List all stadiums pending approval
    /// </summary>
    [HttpGet("stadiums")]
    public async Task<IActionResult> GetPendingStadiums(CancellationToken cancellationToken)
    {
        var response = await _adminService.GetPendingStadiumsAsync(cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Approve a stadium
    /// </summary>
    [HttpPost("stadiums/{id:guid}/approve")]
    public async Task<IActionResult> ApproveStadium(Guid id, CancellationToken cancellationToken)
    {
        var response = await _adminService.ApproveStadiumAsync(id, cancellationToken);
        return Ok(response);
    }
}
