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
    public async Task<IActionResult> GetAll()
    {
        var response = await _stadiumService.GetAllStadiumsAsync();
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var response = await _stadiumService.GetStadiumByIdAsync(id);
        return Ok(response);
    }

    [HttpGet("owner/{ownerId:guid}")]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> GetByOwner(Guid ownerId)
    {
        var response = await _stadiumService.GetStadiumsByOwnerAsync(ownerId);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> Create([FromBody] CreateStadiumDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", "Invalid request data"));
        }

        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(ApiResponse<object>.Fail("UNAUTHORIZED", "User ID not found in token"));
        }

        var response = await _stadiumService.CreateStadiumAsync(ownerId, dto);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStadiumDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", "Invalid request data"));
        }

        var response = await _stadiumService.UpdateStadiumAsync(id, dto);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "StadiumOwner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var response = await _stadiumService.DeleteStadiumAsync(id);
        return Ok(response);
    }
}
