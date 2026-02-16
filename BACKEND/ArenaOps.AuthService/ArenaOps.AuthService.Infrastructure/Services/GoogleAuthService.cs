using System.Text.Json;
using ArenaOps.AuthService.Core.DTOs;
using ArenaOps.AuthService.Core.Entities;
using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.AuthService.Core.Models;
using ArenaOps.AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ArenaOps.AuthService.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly AuthDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly GoogleAuthSettings _googleSettings;
    private readonly HttpClient _httpClient;

    public GoogleAuthService(
        AuthDbContext db,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings,
        IOptions<GoogleAuthSettings> googleSettings,
        HttpClient httpClient)
    {
        _db = db;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
        _googleSettings = googleSettings.Value;
        _httpClient = httpClient;
    }

    public async Task<AuthResponse> GoogleLoginAsync(GoogleLoginRequest request, string? ipAddress, string? userAgent)
    {
        // Step 1: Exchange code for Google tokens
        var tokenResponse = await ExchangeCodeForTokensAsync(request.Code, request.RedirectUri);

        // Step 2: Get user info from Google
        var googleUser = await GetGoogleUserInfoAsync(tokenResponse.AccessToken);

        // Step 3: Find or create user with account linking
        var (user, isNewUser) = await FindOrCreateUserAsync(googleUser, ipAddress, userAgent);

        // Step 4: Generate JWT tokens
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var tokenResult = _tokenService.GenerateTokens(user, roles);

        // Save refresh token
        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.UserId,
            Token = tokenResult.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays)
        });

        // Audit log
        _db.AuthAuditLogs.Add(new AuthAuditLog
        {
            UserId = user.UserId,
            Action = isNewUser ? "GoogleRegister" : "GoogleLogin",
            IpAddress = ipAddress,
            UserAgent = userAgent
        });

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = tokenResult.AccessToken,
            RefreshToken = tokenResult.RefreshToken,
            UserId = user.UserId,
            Roles = roles.ToArray(),
            IsNewUser = isNewUser
        };
    }

    private async Task<GoogleTokenResponse> ExchangeCodeForTokensAsync(string code, string redirectUri)
    {
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _googleSettings.ClientId,
            ["client_secret"] = _googleSettings.ClientSecret,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code"
        });

        var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"GOOGLE_TOKEN_EXCHANGE_FAILED: {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<GoogleTokenResponse>(json,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower })
            ?? throw new InvalidOperationException("GOOGLE_TOKEN_PARSE_FAILED");
    }

    private async Task<GoogleUserInfo> GetGoogleUserInfoAsync(string accessToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("GOOGLE_USERINFO_FAILED");

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<GoogleUserInfo>(json,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower })
            ?? throw new InvalidOperationException("GOOGLE_USERINFO_PARSE_FAILED");
    }

    private async Task<(User user, bool isNewUser)> FindOrCreateUserAsync(
        GoogleUserInfo googleUser, string? ipAddress, string? userAgent)
    {
        // Check if Google account is already linked
        var existingLogin = await _db.ExternalLogins
            .Include(el => el.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(el => el.Provider == "Google" && el.ProviderKey == googleUser.Sub);

        if (existingLogin != null)
        {
            // Already linked — login normally
            return (existingLogin.User, false);
        }

        // Check if a user with this email exists
        var existingUser = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == googleUser.Email);

        if (existingUser != null)
        {
            // Link Google to existing account
            _db.ExternalLogins.Add(new ExternalLogin
            {
                UserId = existingUser.UserId,
                Provider = "Google",
                ProviderKey = googleUser.Sub,
                ProviderDisplayName = googleUser.Name
            });

            existingUser.AuthProvider = existingUser.AuthProvider == "Local" ? "Both" : existingUser.AuthProvider;
            existingUser.ProfilePictureUrl ??= googleUser.Picture;
            existingUser.IsEmailVerified = true;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return (existingUser, false);
        }

        // Create new user from Google profile
        var newUser = new User
        {
            Email = googleUser.Email,
            FullName = googleUser.Name,
            ProfilePictureUrl = googleUser.Picture,
            AuthProvider = "Google",
            IsEmailVerified = true,
            IsActive = true
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        // Assign default role
        var userRole = await _db.Roles.FirstAsync(r => r.Name == "User");
        _db.UserRoles.Add(new UserRole { UserId = newUser.UserId, RoleId = userRole.RoleId });

        // Link Google
        _db.ExternalLogins.Add(new ExternalLogin
        {
            UserId = newUser.UserId,
            Provider = "Google",
            ProviderKey = googleUser.Sub,
            ProviderDisplayName = googleUser.Name
        });

        await _db.SaveChangesAsync();

        // Reload with roles for token generation
        newUser = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstAsync(u => u.UserId == newUser.UserId);

        return (newUser, true);
    }

    // Internal DTOs for Google API responses
    private class GoogleTokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string IdToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }

    private class GoogleUserInfo
    {
        public string Sub { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Picture { get; set; }
        public bool EmailVerified { get; set; }
    }
}
