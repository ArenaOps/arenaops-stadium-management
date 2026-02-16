using System.Security.Cryptography;
using ArenaOps.AuthService.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ArenaOps.AuthService.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;

    public AuthController(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    /// <summary>
    /// Returns the RSA public key in JWKS format.
    /// Core Service uses this to validate JWTs without inter-service calls.
    /// </summary>
    [HttpGet(".well-known/jwks")]
    [AllowAnonymous]
    public IActionResult GetJwks()
    {
        var rsaParams = _tokenService.GetPublicKey();

        var e = Base64UrlEncoder.Encode(rsaParams.Exponent!);
        var n = Base64UrlEncoder.Encode(rsaParams.Modulus!);

        var jwks = new
        {
            keys = new[]
            {
                new
                {
                    kty = "RSA",
                    use = "sig",
                    alg = "RS256",
                    n,
                    e,
                }
            }
        };

        return Ok(jwks);
    }
}
