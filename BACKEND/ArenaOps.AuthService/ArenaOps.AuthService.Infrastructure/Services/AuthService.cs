using System.Security.Cryptography;
using ArenaOps.AuthService.Core.DTOs;
using ArenaOps.AuthService.Core.Entities;
using ArenaOps.AuthService.Core.Exceptions;
using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.AuthService.Core.Models;
using ArenaOps.AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ArenaOps.AuthService.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AuthDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        AuthDbContext db,
        ITokenService tokenService,
        IEmailService emailService,
        IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _tokenService = tokenService;
        _emailService = emailService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, string? userAgent)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ConflictException("EMAIL_EXISTS", "An account with this email already exists.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            AuthProvider = "Local",
            IsEmailVerified = false,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // SECURITY: Always assign "User" role — ignoring client-side role request
        var role = await _db.Roles.FirstAsync(r => r.Name == "User");
        _db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
        await _db.SaveChangesAsync();

        var roles = new List<string> { "User" };
        var tokenResult = _tokenService.GenerateTokens(user, roles);

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.UserId,
            Token = tokenResult.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays)
        });

        _db.AuthAuditLogs.Add(new AuthAuditLog
        {
            UserId = user.UserId,
            Action = "Register",
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
            IsNewUser = true
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            await AuditFailedLoginAsync(request.Email, ipAddress, userAgent);
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await AuditFailedLoginAsync(request.Email, ipAddress, userAgent, user.UserId);
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password.");
        }

        if (!user.IsActive)
            throw new UnauthorizedException("ACCOUNT_DISABLED", "Your account has been disabled.");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var tokenResult = _tokenService.GenerateTokens(user, roles);

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.UserId,
            Token = tokenResult.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays)
        });

        _db.AuthAuditLogs.Add(new AuthAuditLog
        {
            UserId = user.UserId,
            Action = "Login",
            IpAddress = ipAddress,
            UserAgent = userAgent
        });

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = tokenResult.AccessToken,
            RefreshToken = tokenResult.RefreshToken,
            UserId = user.UserId,
            Roles = roles.ToArray(),
            IsNewUser = false
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken)
            ?? throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Refresh token is invalid.");

        if (storedToken.RevokedAt != null)
            throw new UnauthorizedException("TOKEN_REVOKED", "Refresh token has been revoked.");

        if (storedToken.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("TOKEN_EXPIRED", "Refresh token has expired.");

        var user = storedToken.User;
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var tokenResult = _tokenService.GenerateTokens(user, roles);

        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.ReplacedByToken = tokenResult.RefreshToken;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.UserId,
            Token = tokenResult.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays)
        });

        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = tokenResult.AccessToken,
            RefreshToken = tokenResult.RefreshToken,
            UserId = user.UserId,
            Roles = roles.ToArray(),
            IsNewUser = false
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken == null)
            return;

        // Remove the token from the database entirely
        _db.RefreshTokens.Remove(storedToken);
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Admin-only: Creates a Stadium Manager (StadiumOwner role) with a generated temporary password.
    /// Sends the credentials via IEmailService.
    /// </summary>
    public async Task<CreateStadiumManagerResponse> CreateStadiumManagerAsync(
        CreateStadiumManagerRequest request, string? ipAddress, string? userAgent)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ConflictException("EMAIL_EXISTS", "An account with this email already exists.");

        // Generate a secure temporary password
        var tempPassword = GenerateTemporaryPassword();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            AuthProvider = "Local",
            IsEmailVerified = false,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Assign StadiumOwner role
        var role = await _db.Roles.FirstAsync(r => r.Name == "StadiumOwner");
        _db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });

        // Audit log
        _db.AuthAuditLogs.Add(new AuthAuditLog
        {
            UserId = user.UserId,
            Action = "StadiumManagerCreated",
            IpAddress = ipAddress,
            UserAgent = userAgent
        });

        await _db.SaveChangesAsync();

        // Send credentials via email (mock for now)
        await _emailService.SendStadiumManagerCredentialsAsync(request.Email, request.FullName, tempPassword);

        return new CreateStadiumManagerResponse
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Role = "StadiumOwner",
            Message = "Stadium Manager account created. Temporary password sent to their email."
        };
    }

    private async Task AuditFailedLoginAsync(string email, string? ipAddress, string? userAgent, Guid? userId = null)
    {
        _db.AuthAuditLogs.Add(new AuthAuditLog
        {
            UserId = userId ?? Guid.Empty,
            Action = "FailedLogin",
            IpAddress = ipAddress,
            UserAgent = userAgent
        });
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Generates a secure temporary password: 12 chars with uppercase, lowercase, digit, and special char.
    /// </summary>
    private static string GenerateTemporaryPassword()
    {
        const string uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lowercase = "abcdefghjkmnpqrstuvwxyz";
        const string digits = "23456789";
        const string special = "!@#$%&*";
        const string allChars = uppercase + lowercase + digits + special;

        var password = new char[12];
        var rng = RandomNumberGenerator.Create();
        var bytes = new byte[12];
        rng.GetBytes(bytes);

        // Ensure at least one of each type
        password[0] = uppercase[bytes[0] % uppercase.Length];
        password[1] = lowercase[bytes[1] % lowercase.Length];
        password[2] = digits[bytes[2] % digits.Length];
        password[3] = special[bytes[3] % special.Length];

        // Fill remaining with random chars
        for (int i = 4; i < 12; i++)
            password[i] = allChars[bytes[i] % allChars.Length];

        // Shuffle using Fisher-Yates
        var shuffleBytes = new byte[12];
        rng.GetBytes(shuffleBytes);
        for (int i = password.Length - 1; i > 0; i--)
        {
            int j = shuffleBytes[i] % (i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}
