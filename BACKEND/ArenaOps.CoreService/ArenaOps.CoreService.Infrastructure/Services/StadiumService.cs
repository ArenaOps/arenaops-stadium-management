using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Domain.Entities;
using ArenaOps.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class StadiumService : IStadiumService
{
    private readonly IStadiumRepository _stadiumRepository;

    public StadiumService(IStadiumRepository stadiumRepository)
    {
        _stadiumRepository = stadiumRepository;
    }

    public async Task<ApiResponse<IEnumerable<StadiumDto>>> GetAllStadiumsAsync()
    {
        var stadiums = await _stadiumRepository.GetAllAsync();
        var dtos = stadiums.Select(MapToDto);
        return ApiResponse<IEnumerable<StadiumDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<StadiumDto>> GetStadiumByIdAsync(Guid id)
    {
        var stadium = await _stadiumRepository.GetByIdAsync(id);
        if (stadium == null)
            return ApiResponse<StadiumDto>.Fail("NOT_FOUND", "Stadium not found");

        return ApiResponse<StadiumDto>.Ok(MapToDto(stadium));
    }

    public async Task<ApiResponse<IEnumerable<StadiumDto>>> GetStadiumsByOwnerAsync(Guid ownerId)
    {
        var stadiums = await _stadiumRepository.GetByOwnerAsync(ownerId);
        var dtos = stadiums.Select(MapToDto);
        return ApiResponse<IEnumerable<StadiumDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<StadiumDto>> CreateStadiumAsync(Guid ownerId, CreateStadiumDto dto)
    {
        var stadium = new Stadium
        {
            OwnerId = ownerId,
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            Country = dto.Country,
            Pincode = dto.Pincode,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            IsApproved = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _stadiumRepository.AddAsync(stadium);
        await _stadiumRepository.SaveChangesAsync();

        return ApiResponse<StadiumDto>.Ok(MapToDto(stadium), "Stadium created successfully");
    }

    public async Task<ApiResponse<StadiumDto>> UpdateStadiumAsync(Guid id, UpdateStadiumDto dto)
    {
        var stadium = await _stadiumRepository.GetByIdAsync(id);
        if (stadium == null)
            return ApiResponse<StadiumDto>.Fail("NOT_FOUND", "Stadium not found");

        stadium.Name = dto.Name;
        stadium.Address = dto.Address;
        stadium.City = dto.City;
        stadium.State = dto.State;
        stadium.Country = dto.Country;
        stadium.Pincode = dto.Pincode;
        stadium.Latitude = dto.Latitude;
        stadium.Longitude = dto.Longitude;
        stadium.IsActive = dto.IsActive;

        await _stadiumRepository.UpdateAsync(stadium);
        await _stadiumRepository.SaveChangesAsync();

        return ApiResponse<StadiumDto>.Ok(MapToDto(stadium), "Stadium updated successfully");
    }

    public async Task<ApiResponse<object>> DeleteStadiumAsync(Guid id)
    {
        var stadium = await _stadiumRepository.GetByIdAsync(id);
        if (stadium == null)
            return ApiResponse<object>.Fail("NOT_FOUND", "Stadium not found");

        await _stadiumRepository.DeleteAsync(stadium);
        await _stadiumRepository.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { message = "Stadium deleted successfully" });
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
