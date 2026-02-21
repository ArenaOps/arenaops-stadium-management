using ArenaOps.CoreService.Application.DTOs;
using ArenaOps.Shared.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface IStadiumService
{
    Task<ApiResponse<IEnumerable<StadiumDto>>> GetAllStadiumsAsync();
    Task<ApiResponse<StadiumDto>> GetStadiumByIdAsync(Guid id);
    Task<ApiResponse<IEnumerable<StadiumDto>>> GetStadiumsByOwnerAsync(Guid ownerId);
    Task<ApiResponse<StadiumDto>> CreateStadiumAsync(Guid ownerId, CreateStadiumDto dto);
    Task<ApiResponse<StadiumDto>> UpdateStadiumAsync(Guid id, UpdateStadiumDto dto);
    Task<ApiResponse<object>> DeleteStadiumAsync(Guid id);
}
