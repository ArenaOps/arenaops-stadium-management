using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.API.Controllers;

[ApiController]
[Route("api/stadiums")]
public class StadiumController : ControllerBase
{
    [HttpGet("ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return Ok(ApiResponse<object>.Ok(new { message = "pong", service = "CoreService" }));
    }

    [HttpGet("test")]
    [Authorize]
    public IActionResult Test()
    {
        var userName = User.Identity?.Name;
        var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            message = "Success! You are authenticated on CoreService.",
            user = userName,
            userId = userId,
            roles = roles,
            claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        }));
    }

    [HttpPost]
    [Authorize(Policy = "StadiumOwner")]
    public IActionResult CreateStadium([FromBody] object stadiumDto)
    {
        // This endpoint requires the user to have the "StadiumOwner" role
        return Ok(ApiResponse<object>.Ok(new 
        { 
            message = "Stadium creation authorized!", 
            user = User.Identity?.Name,
            role = "StadiumOwner"
        }));
    }
}
