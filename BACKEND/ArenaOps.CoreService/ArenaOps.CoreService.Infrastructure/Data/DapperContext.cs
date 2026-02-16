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
        
        var useShared = _configuration.GetValue<bool>("Infrastructure:UseSharedDatabase");
        _connectionString = useShared 
            ? _configuration.GetConnectionString("CoreDB_Shared")! 
            : _configuration.GetConnectionString("CoreDB_Local")!;
    }

    public IDbConnection CreateConnection() 
        => new SqlConnection(_connectionString);
}
