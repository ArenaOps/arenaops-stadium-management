using Serilog;
using Microsoft.EntityFrameworkCore;
using ArenaOps.CoreService.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Database Connection (Hosted DB)
var connectionString = builder.Configuration.GetConnectionString("CoreDb");

// TODO: Re-add Redis when hosted Redis provider is configured
// var redisConnectionString = builder.Configuration.GetConnectionString("Redis");

// 3. Register Services
builder.Services.AddSingleton<ArenaOps.CoreService.Application.Interfaces.IDapperContext, ArenaOps.CoreService.Infrastructure.Data.DapperContext>();

// 3a. Register EF Core DbContext
builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseSqlServer(connectionString));


// 4. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString!, name: "SQL Server");
    // TODO: Re-add Redis health check when hosted Redis is available
    // .AddRedis(redisConnectionString!, name: "Redis");

var app = builder.Build();

// 5. Configure the HTTP request pipeline
app.UseSerilogRequestLogging();
app.UseHttpsRedirection();

// 6. Map Health Check endpoint
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
