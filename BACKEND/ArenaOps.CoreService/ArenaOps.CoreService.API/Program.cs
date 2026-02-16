using Serilog;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Determine Connection String (Hybrid Approach)
var useShared = builder.Configuration.GetValue<bool>("Infrastructure:UseSharedDatabase");
var connectionString = useShared 
    ? builder.Configuration.GetConnectionString("CoreDB_Shared") 
    : builder.Configuration.GetConnectionString("CoreDB_Local");

var redisConnectionString = builder.Configuration.GetConnectionString("Redis_Local");

// 3. Register Services
builder.Services.AddSingleton<ArenaOps.CoreService.Application.Interfaces.IDapperContext, ArenaOps.CoreService.Infrastructure.Data.DapperContext>();

// 4. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString!, name: "SQL Server")
    .AddRedis(redisConnectionString!, name: "Redis");

var app = builder.Build();

// 4. Configure the HTTP request pipeline.
app.UseSerilogRequestLogging();
app.UseHttpsRedirection();

// 5. Map Health Check endpoint
app.MapHealthChecks("/health");

app.MapGet("/", () => "ArenaOps CoreService API is running.");

try
{
    Log.Information("Starting ArenaOps CoreService API...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
