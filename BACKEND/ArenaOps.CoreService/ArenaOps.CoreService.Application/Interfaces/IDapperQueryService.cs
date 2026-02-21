using System.Data;
using ArenaOps.CoreService.Application.Models;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface IDapperQueryService
{
    // ── QUERY ──────────────────────────────────────

    Task<IEnumerable<T>> QueryAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    Task<T?> QueryFirstOrDefaultAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    Task<T> QuerySingleAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    Task<T?> ExecuteScalarAsync<T>(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    Task<PagedResult<T>> QueryPagedAsync<T>(
        string countSql,
        string dataSql,
        object? parameters = null,
        int page = 1,
        int pageSize = 20,
        int? commandTimeout = null);

    // ── EXECUTE ───────────────────────────────────

    Task<int> ExecuteAsync(
        string sql,
        object? parameters = null,
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    // ── STORED PROCEDURES ─────────────────────────

    Task<StoredProcedureResult<T>> ExecuteStoredProcAsync<T>(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null);

    Task<IEnumerable<T>> QueryStoredProcAsync<T>(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null);

    Task<StoredProcedureResult> ExecuteStoredProcNonQueryAsync(
        string procedureName,
        object? parameters = null,
        int? commandTimeout = null);

    // ── MULTI-MAPPING (Joins) ─────────────────────

    Task<IEnumerable<TReturn>> QueryMultiMapAsync<TFirst, TSecond, TReturn>(
        string sql,
        Func<TFirst, TSecond, TReturn> map,
        object? parameters = null,
        string splitOn = "Id",
        CommandType commandType = CommandType.Text,
        int? commandTimeout = null);

    // ── TRANSACTIONS ──────────────────────────────

    Task ExecuteInTransactionAsync(
        Func<IDbConnection, IDbTransaction, Task> action,
        IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);

    Task<T> ExecuteInTransactionAsync<T>(
        Func<IDbConnection, IDbTransaction, Task<T>> action,
        IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);
}
