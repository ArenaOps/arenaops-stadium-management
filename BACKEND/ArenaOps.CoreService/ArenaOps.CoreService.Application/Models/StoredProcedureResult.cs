namespace ArenaOps.CoreService.Application.Models;

public class StoredProcedureResult
{
    public bool Success { get; set; }
    public int RowsAffected { get; set; }
    public string? Message { get; set; }

    public static StoredProcedureResult Ok(int rowsAffected = 1, string? message = null)
        => new() { Success = true, RowsAffected = rowsAffected, Message = message };

    public static StoredProcedureResult Fail(string message)
        => new() { Success = false, RowsAffected = 0, Message = message };
}

public class StoredProcedureResult<T> : StoredProcedureResult
{
    public T? Data { get; set; }

    public static StoredProcedureResult<T> Ok(T data, int rowsAffected = 1, string? message = null)
        => new() { Success = true, Data = data, RowsAffected = rowsAffected, Message = message };

    public static new StoredProcedureResult<T> Fail(string message)
        => new() { Success = false, Data = default, RowsAffected = 0, Message = message };
}
