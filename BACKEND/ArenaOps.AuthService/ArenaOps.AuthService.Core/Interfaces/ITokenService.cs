using System.Security.Claims;
using System.Security.Cryptography;
using ArenaOps.AuthService.Core.Entities;
using ArenaOps.AuthService.Core.Models;

namespace ArenaOps.AuthService.Core.Interfaces;

public interface ITokenService
{
    /// <summary>
    /// Generates an access token (JWT signed with RSA private key) and a refresh token.
    /// </summary>
    TokenResult GenerateTokens(User user, IList<string> roles);

    /// <summary>
    /// Returns the RSA public key parameters for JWKS endpoint.
    /// </summary>
    RSAParameters GetPublicKey();

    /// <summary>
    /// Validates a JWT token and returns the claims principal, or null if invalid.
    /// </summary>
    ClaimsPrincipal? ValidateToken(string token);
}
