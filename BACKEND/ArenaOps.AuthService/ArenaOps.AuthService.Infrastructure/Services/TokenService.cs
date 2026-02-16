using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using ArenaOps.AuthService.Core.Entities;
using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.AuthService.Core.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ArenaOps.AuthService.Infrastructure.Services;

public class TokenService : ITokenService, IDisposable
{
    private readonly RSA _rsa;
    private readonly JwtSettings _jwtSettings;
    private readonly RsaSecurityKey _signingKey;

    public TokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
        _rsa = RSA.Create(2048);

        // Load or generate RSA key pair
        var keyPath = _jwtSettings.KeyFilePath;
        var keyDir = Path.GetDirectoryName(keyPath);

        if (!string.IsNullOrEmpty(keyDir) && !Directory.Exists(keyDir))
        {
            Directory.CreateDirectory(keyDir);
        }

        if (File.Exists(keyPath))
        {
            // Load existing private key
            var keyPem = File.ReadAllText(keyPath);
            _rsa.ImportFromPem(keyPem);
        }
        else
        {
            // Generate new key pair and save private key
            var privateKeyPem = _rsa.ExportRSAPrivateKeyPem();
            File.WriteAllText(keyPath, privateKeyPem);
        }

        _signingKey = new RsaSecurityKey(_rsa);
    }

    public TokenResult GenerateTokens(User user, IList<string> roles)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("fullName", user.FullName),
        };

        // Add role claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        // Generate opaque refresh token
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return new TokenResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };
    }

    public RSAParameters GetPublicKey()
    {
        return _rsa.ExportParameters(includePrivateParameters: false);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ClockSkew = TimeSpan.FromMinutes(1)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    public void Dispose()
    {
        _rsa.Dispose();
    }
}
