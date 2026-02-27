using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IStadiumRepository _stadiumRepository;

    public AdminService(IStadiumRepository stadiumRepository)
    {
        _stadiumRepository = stadiumRepository;
    }

    public async Task<ApiResponse<IEnumerable<StadiumDto>>> GetPendingStadiumsAsync(CancellationToken cancellationToken = default)
    {
        var stadiums = await _stadiumRepository.GetPendingApprovalAsync();
        var dtos = stadiums.Select(MapToDto);
        return ApiResponse<IEnumerable<StadiumDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<StadiumDto>> ApproveStadiumAsync(Guid stadiumId, CancellationToken cancellationToken = default)
    {
        var stadium = await _stadiumRepository.GetByIdAsync(stadiumId);
        if (stadium == null)
            return ApiResponse<StadiumDto>.Fail("NOT_FOUND", "Stadium not found");

        if (stadium.IsApproved)
            return ApiResponse<StadiumDto>.Fail("ALREADY_APPROVED", "Stadium is already approved");

        stadium.IsApproved = true;

        await _stadiumRepository.UpdateAsync(stadium);
        await _stadiumRepository.SaveChangesAsync();

        return ApiResponse<StadiumDto>.Ok(MapToDto(stadium), "Stadium approved successfully");
    }

    private static StadiumDto MapToDto(Stadium stadium)
    {
        return new StadiumDto
        {
            StadiumId = stadium.StadiumId,
            OwnerId = stadium.OwnerId,
            Name = stadium.Name,
            Address = stadium.Address,
            City = stadium.City,
            State = stadium.State,
            Country = stadium.Country,
            Pincode = stadium.Pincode,
            Latitude = stadium.Latitude,
            Longitude = stadium.Longitude,
            IsApproved = stadium.IsApproved,
            CreatedAt = stadium.CreatedAt,
            IsActive = stadium.IsActive
        };
    }
}
