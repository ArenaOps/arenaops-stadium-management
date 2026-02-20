namespace ArenaOps.Shared.Exceptions;

/// <summary>
/// Base exception for all application-level errors.
/// Maps to specific HTTP status codes via the global exception handler.
/// </summary>
public abstract class AppException : Exception
{
    public string Code { get; }
    public int StatusCode { get; }

    protected AppException(string code, string message, int statusCode) : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }
}

/// <summary>409 Conflict — duplicate resource, email already exists, etc.</summary>
public class ConflictException : AppException
{
    public ConflictException(string code, string message) : base(code, message, 409) { }
}

/// <summary>401 Unauthorized — invalid credentials, expired token, etc.</summary>
public class UnauthorizedException : AppException
{
    public UnauthorizedException(string code, string message) : base(code, message, 401) { }
}

/// <summary>400 Bad Request — invalid input, missing fields, etc.</summary>
public class BadRequestException : AppException
{
    public BadRequestException(string code, string message) : base(code, message, 400) { }
}

/// <summary>404 Not Found — resource not found.</summary>
public class NotFoundException : AppException
{
    public NotFoundException(string code, string message) : base(code, message, 404) { }
}

/// <summary>403 Forbidden — authenticated but not enough permissions.</summary>
public class ForbiddenException : AppException
{
    public ForbiddenException(string code, string message) : base(code, message, 403) { }
}
