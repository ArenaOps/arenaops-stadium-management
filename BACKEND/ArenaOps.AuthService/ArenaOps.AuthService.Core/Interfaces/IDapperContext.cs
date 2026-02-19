using System.Data;

namespace ArenaOps.AuthService.Core.Interfaces;

public interface IDapperContext
{
    IDbConnection CreateConnection();
}
