using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ArenaOps.Shared.Models;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Application.DTOs;

namespace ArenaOps.CoreService.API.Controllers;

[ApiController]
[Route("api/stadiums")]
public class StadiumController : ControllerBase
{
    private readonly IStadiumService _stadiumService;

    public StadiumController(IStadiumService stadiumService)
    {
        _stadiumService = stadiumService;
    }

    [HttpGet("ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return Ok(ApiResponse<object>.Ok(new { message = "pong", service = "CoreService" }));
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var response = await _stadiumService.GetAllStadiumsAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var response = await _stadiumService.GetStadiumByIdAsync(id);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpGet("owner/{ownerId}")]
    [Authorize]
    public async Task<IActionResult> GetByOwner(Guid ownerId)
    {
        var response = await _stadiumService.GetStadiumsByOwnerAsync(ownerId);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> Create([FromBody] CreateStadiumDto dto)
    {
        var userIdStr = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out Guid userId))
            return Unauthorized(ApiResponse<object>.Fail("UNAUTHORIZED", "Invalid user ID in token"));

        var response = await _stadiumService.CreateStadiumAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = response.Data?.StadiumId }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStadiumDto dto)
    {
        var response = await _stadiumService.UpdateStadiumAsync(id, dto);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var response = await _stadiumService.DeleteStadiumAsync(id);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }
}
