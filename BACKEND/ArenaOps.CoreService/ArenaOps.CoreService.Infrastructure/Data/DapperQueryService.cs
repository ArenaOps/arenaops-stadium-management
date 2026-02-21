using System.Data;
using System.Diagnostics;
using ArenaOps.CoreService.Application.Interfaces;
using ArenaOps.CoreService.Application.Models;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ArenaOps.CoreService.Infrastructure.Data;

public class DapperQueryService : IDapperQueryService
{
    private readonly IDapperContext _context;
    private readonly ILogger<DapperQueryService> _logger;

    public DapperQueryService(IDapperContext context, ILogger<DapperQueryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ── QUERY ──────────────────────────────────────

    public async Task<IEnumerable<T>> QueryAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<T>(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper QueryAsync<{Type}> completed in {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper QueryAsync<{Type}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QueryFirstOrDefaultAsync<T>(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper QueryFirstOrDefault<{Type}> completed in {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper QueryFirstOrDefault<{Type}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    public async Task<T> QuerySingleAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QuerySingleAsync<T>(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper QuerySingle<{Type}> completed in {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper QuerySingle<{Type}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    public async Task<T?> ExecuteScalarAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.ExecuteScalarAsync<T>(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper ExecuteScalar<{Type}> completed in {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper ExecuteScalar<{Type}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    public async Task<PagedResult<T>> QueryPagedAsync<T>(
        string countSql,
        string dataSql,
        object? parameters = null,
        int page = 1,
        int pageSize = 20,
        int? commandTimeout = null)
    {
        var (offset, clampedPageSize) = DapperExtensions.GetPaginationParams(page, pageSize);
        var sw = Stopwatch.StartNew();

        try
        {
            using var connection = _context.CreateConnection();

            var combinedSql = $"{countSql};{dataSql}";
            var paginatedParams = new DynamicParameters(parameters);
            paginatedParams.Add("Offset", offset);
            paginatedParams.Add("PageSize", clampedPageSize);

            using var multi = await connection.QueryMultipleAsync(combinedSql, paginatedParams, commandTimeout: commandTimeout);

            var totalCount = await multi.ReadSingleAsync<int>();
            var items = (await multi.ReadAsync<T>()).ToList();

            sw.Stop();
            _logger.LogDebug("Dapper QueryPaged<{Type}> completed in {ElapsedMs}ms | Page {Page}/{TotalPages} | {Count} items",
                typeof(T).Name, sw.ElapsedMilliseconds, Math.Max(1, page), 
                clampedPageSize > 0 ? (int)Math.Ceiling((double)totalCount / clampedPageSize) : 0,
                items.Count);

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = totalCount,
                Page = Math.Max(1, page),
                PageSize = clampedPageSize
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper QueryPaged<{Type}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(T).Name, sw.ElapsedMilliseconds, TruncateSql(countSql));
            throw;
        }
    }

    // ── EXECUTE ───────────────────────────────────

    public async Task<int> ExecuteAsync(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var rowsAffected = await connection.ExecuteAsync(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper ExecuteAsync completed in {ElapsedMs}ms | {RowsAffected} rows | SQL: {Sql}",
                sw.ElapsedMilliseconds, rowsAffected, TruncateSql(sql));

            return rowsAffected;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper ExecuteAsync FAILED after {ElapsedMs}ms | SQL: {Sql}",
                sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    // ── STORED PROCEDURES ─────────────────────────

    public async Task<StoredProcedureResult<T>> ExecuteStoredProcAsync<T>(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QueryStoredProcSingleAsync<T>(procedureName, parameters, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper SP '{ProcName}' completed in {ElapsedMs}ms | HasResult: {HasResult}",
                procedureName, sw.ElapsedMilliseconds, result is not null);

            return result is not null
                ? StoredProcedureResult<T>.Ok(result)
                : StoredProcedureResult<T>.Fail($"Stored procedure '{procedureName}' returned no result.");
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper SP '{ProcName}' FAILED after {ElapsedMs}ms",
                procedureName, sw.ElapsedMilliseconds);
            throw;
        }
    }

    public async Task<IEnumerable<T>> QueryStoredProcAsync<T>(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QueryStoredProcAsync<T>(procedureName, parameters, commandTimeout: commandTimeout);
            sw.Stop();

            var count = result.TryGetNonEnumeratedCount(out int c) ? c : -1;
            _logger.LogDebug("Dapper SP '{ProcName}' query completed in {ElapsedMs}ms | Count: {Count}",
                procedureName, sw.ElapsedMilliseconds, count);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper SP '{ProcName}' query FAILED after {ElapsedMs}ms",
                procedureName, sw.ElapsedMilliseconds);
            throw;
        }
    }

    public async Task<StoredProcedureResult> ExecuteStoredProcNonQueryAsync(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var rowsAffected = await connection.ExecuteStoredProcAsync(procedureName, parameters, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper SP '{ProcName}' non-query completed in {ElapsedMs}ms | {RowsAffected} rows",
                procedureName, sw.ElapsedMilliseconds, rowsAffected);

            return StoredProcedureResult.Ok(rowsAffected);
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper SP '{ProcName}' non-query FAILED after {ElapsedMs}ms",
                procedureName, sw.ElapsedMilliseconds);
            throw;
        }
    }

    // ── MULTI-MAPPING (Joins) ─────────────────────

    public async Task<IEnumerable<TReturn>> QueryMultiMapAsync<TFirst, TSecond, TReturn>(
        string sql,
        Func<TFirst, TSecond, TReturn> map,
        object? parameters = null,
        string splitOn = "Id",
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync(sql, map, parameters, splitOn: splitOn, commandType: commandType, commandTimeout: commandTimeout);
            sw.Stop();

            _logger.LogDebug("Dapper MultiMap<{T1},{T2}> completed in {ElapsedMs}ms | SQL: {Sql}",
                typeof(TFirst).Name, typeof(TSecond).Name, sw.ElapsedMilliseconds, TruncateSql(sql));

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper MultiMap<{T1},{T2}> FAILED after {ElapsedMs}ms | SQL: {Sql}",
                typeof(TFirst).Name, typeof(TSecond).Name, sw.ElapsedMilliseconds, TruncateSql(sql));
            throw;
        }
    }

    // ── TRANSACTIONS ──────────────────────────────

    public async Task ExecuteInTransactionAsync(
        Func<IDbConnection, IDbTransaction, Task> action,
        IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
    {
        var sw = Stopwatch.StartNew();
        using var connection = _context.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction(isolationLevel);

        try
        {
            await action(connection, transaction);
            transaction.Commit();
            sw.Stop();

            _logger.LogDebug("Dapper Transaction committed in {ElapsedMs}ms | Isolation: {Isolation}",
                sw.ElapsedMilliseconds, isolationLevel);
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper Transaction ROLLED BACK after {ElapsedMs}ms | Isolation: {Isolation}",
                sw.ElapsedMilliseconds, isolationLevel);

            try
            {
                transaction.Rollback();
            }
            catch (Exception rollbackEx)
            {
                _logger.LogCritical(rollbackEx, "Dapper Transaction ROLLBACK FAILED — data may be inconsistent!");
            }

            throw;
        }
    }

    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<IDbConnection, IDbTransaction, Task<T>> action,
        IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
    {
        var sw = Stopwatch.StartNew();
        using var connection = _context.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction(isolationLevel);

        try
        {
            var result = await action(connection, transaction);
            transaction.Commit();
            sw.Stop();

            _logger.LogDebug("Dapper Transaction<{Type}> committed in {ElapsedMs}ms | Isolation: {Isolation}",
                typeof(T).Name, sw.ElapsedMilliseconds, isolationLevel);

            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Dapper Transaction<{Type}> ROLLED BACK after {ElapsedMs}ms | Isolation: {Isolation}",
                typeof(T).Name, sw.ElapsedMilliseconds, isolationLevel);

            try
            {
                transaction.Rollback();
            }
            catch (Exception rollbackEx)
            {
                _logger.LogCritical(rollbackEx, "Dapper Transaction<{Type}> ROLLBACK FAILED — data may be inconsistent!",
                    typeof(T).Name);
            }

            throw;
        }
    }

    // ── HELPERS ───────────────────────────────────

    private static string TruncateSql(string sql)
        => sql.Length > 200 ? string.Concat(sql.AsSpan(0, 200), "...") : sql;
}
