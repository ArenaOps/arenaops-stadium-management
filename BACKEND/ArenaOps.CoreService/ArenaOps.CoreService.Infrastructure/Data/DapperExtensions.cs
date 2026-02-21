using System.Data;
using Dapper;

namespace ArenaOps.CoreService.Infrastructure.Data;

public static class DapperExtensions
{
    // ── STORED PROCEDURE shortcuts ────────────────

    public static async Task<IEnumerable<T>> QueryStoredProcAsync<T>(
        this IDbConnection connection,
        string procedureName,
        object? parameters = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null)
    {
        return await connection.QueryAsync<T>(
            procedureName,
            parameters,
            transaction: transaction,
            commandTimeout: commandTimeout,
            commandType: CommandType.StoredProcedure);
    }

    public static async Task<T?> QueryStoredProcSingleAsync<T>(
        this IDbConnection connection,
        string procedureName,
        object? parameters = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null)
    {
        return await connection.QueryFirstOrDefaultAsync<T>(
            procedureName,
            parameters,
            transaction: transaction,
            commandTimeout: commandTimeout,
            commandType: CommandType.StoredProcedure);
    }

    public static async Task<int> ExecuteStoredProcAsync(
        this IDbConnection connection,
        string procedureName,
        object? parameters = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null)
    {
        return await connection.ExecuteAsync(
            procedureName,
            parameters,
            transaction: transaction,
            commandTimeout: commandTimeout,
            commandType: CommandType.StoredProcedure);
    }

    // ── PAGINATION helpers ────────────────────────

    public static (int Offset, int PageSize) GetPaginationParams(int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var offset = (page - 1) * pageSize;
        return (offset, pageSize);
    }

    // ── IN-CLAUSE helper ──────────────────────────

    public static DynamicParameters CreateInClauseParams<T>(string paramName, IEnumerable<T> values)
    {
        var parameters = new DynamicParameters();
        parameters.Add(paramName, values);
        return parameters;
    }

    // ── DYNAMIC PARAMETERS builder ────────────────

    public static DynamicParameters CreateWithOutput(
        string outputParamName,
        DbType dbType = DbType.Int32,
        object? inputParams = null)
    {
        var parameters = new DynamicParameters(inputParams);
        parameters.Add(outputParamName, dbType: dbType, direction: ParameterDirection.Output);
        return parameters;
    }
}
