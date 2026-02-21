using System.Text.Json;
using ArenaOps.Shared.Exceptions;
using ArenaOps.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ArenaOps.Shared.Middleware;

/// <summary>
/// Global exception handler middleware.
/// Catches all exceptions and returns a standardized ApiResponse envelope.
/// Controllers never need try/catch — just throw AppException subclasses.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            // Expected business error — log as warning
            _logger.LogWarning("Business error: {Code} — {Message}", ex.Code, ex.Message);
            await WriteErrorResponse(context, ex.StatusCode, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            // Unexpected error — log full stack
            _logger.LogError(ex, "Unhandled exception");
            await WriteErrorResponse(context, 500, "INTERNAL_ERROR", "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorResponse(HttpContext context, int statusCode, string code, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.Fail(code, message);
        var json = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
