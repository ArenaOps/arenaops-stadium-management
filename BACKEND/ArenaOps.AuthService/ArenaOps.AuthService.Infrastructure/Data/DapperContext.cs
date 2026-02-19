using System.Data;
using ArenaOps.AuthService.Core.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ArenaOps.AuthService.Infrastructure.Data;

public class DapperContext : IDapperContext
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("AuthDb")!;
    }

    public IDbConnection CreateConnection() 
        => new SqlConnection(_connectionString);
}
