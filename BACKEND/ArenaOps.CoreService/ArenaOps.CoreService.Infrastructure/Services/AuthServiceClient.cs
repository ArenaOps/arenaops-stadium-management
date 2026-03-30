using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.Shared.Models;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;

namespace ArenaOps.CoreService.Infrastructure.Services;

public class AuthServiceClient : IAuthServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AuthServiceClient> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthServiceClient(
        HttpClient httpClient, 
        ILogger<AuthServiceClient> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<UserStatsDto> GetUserStatsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Pass the incoming bearer token downstream if available
            var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                var token = authorizationHeader.Substring("Bearer ".Length).Trim();
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await _httpClient.GetAsync("/api/auth/users/stats", cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                // The AuthService wraps its responses in an envelope. Wait, let's verify what the endpoint returns.
                // The controller said: "return Ok(new { success = true, data = stats });"
                // Let's create an anonymous-like envelope or just use ApiResponse<T> from ArenaOps.Shared.Models.
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<UserStatsDto>>(cancellationToken: cancellationToken);
                if (result != null && result.Success && result.Data != null)
                {
                    return result.Data;
                }
            }
            
            _logger.LogWarning("Failed to fetch user stats from AuthService. Status Code: {StatusCode}", response.StatusCode);
            return new UserStatsDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while fetching user stats from AuthService");
            return new UserStatsDto();
        }
    }
}
