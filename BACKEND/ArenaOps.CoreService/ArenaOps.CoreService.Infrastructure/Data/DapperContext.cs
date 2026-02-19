using System.Data;
using ArenaOps.CoreService.Application.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ArenaOps.CoreService.Infrastructure.Data;

public class DapperContext : IDapperContext
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("CoreDb")!;
    }

    public IDbConnection CreateConnection() 
        => new SqlConnection(_connectionString);
}
