using System.Data;

namespace ArenaOps.CoreService.Application.Interfaces;

public interface IDapperContext
{
    IDbConnection CreateConnection();
}
