using System.Security.Cryptography;
using ArenaOps.AuthService.Core.DTOs;
using ArenaOps.AuthService.Core.Interfaces;
using ArenaOps.AuthService.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ArenaOps.AuthService.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly IAuthService _authService;
    private readonly IGoogleAuthService _googleAuthService;

    public AuthController(ITokenService tokenService, IAuthService authService, IGoogleAuthService googleAuthService)
    {
        _tokenService = tokenService;
        _authService = authService;
        _googleAuthService = googleAuthService;
    }

    /// <summary>
    /// Register a new user with email/password.
    /// Role is always set to "User" — ignoring client-side role requests for security.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();

        var result = await _authService.RegisterAsync(request, ip, ua);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Registration successful"));
    }

    /// <summary>
    /// Login with email/password.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ip, ua);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Login successful"));
    }

    /// <summary>
    /// Refresh an access token using a valid refresh token.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(ApiResponse<AuthResponse>.Ok(result));
    }

    /// <summary>
    /// Logout by revoking a refresh token.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        await _authService.LogoutAsync(request.RefreshToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Logged out successfully"));
    }

    /// <summary>
    /// Google OAuth 2.0 login — exchange authorization code for JWT tokens.
    /// Automatically creates or links accounts based on Google email.
    /// </summary>
    [HttpPost("google")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();

        var result = await _googleAuthService.GoogleLoginAsync(request, ip, ua);
        return Ok(ApiResponse<AuthResponse>.Ok(result, result.IsNewUser ? "Account created via Google" : "Google login successful"));
    }

    /// <summary>
    /// Admin-only: Create a Stadium Manager account with a temporary password.
    /// The temporary password is sent to the manager's email.
    /// </summary>
    [HttpPost("stadium-manager")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CreateStadiumManagerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStadiumManager([FromBody] CreateStadiumManagerRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();

        var result = await _authService.CreateStadiumManagerAsync(request, ip, ua);
        return Ok(ApiResponse<CreateStadiumManagerResponse>.Ok(result, "Stadium Manager created successfully"));
    }

    /// <summary>
    /// Returns the RSA public key in JWKS format.
    /// Core Service uses this to validate JWTs without inter-service calls.
    /// </summary>
    [HttpGet(".well-known/jwks")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
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
