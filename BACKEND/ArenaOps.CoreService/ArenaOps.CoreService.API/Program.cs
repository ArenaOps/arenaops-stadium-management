using Serilog;
using Microsoft.EntityFrameworkCore;
using ArenaOps.CoreService.Infrastructure.Data;
using ArenaOps.Shared.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Database Connection (Hosted DB)
var connectionString = builder.Configuration.GetConnectionString("CoreDb");

// 3. Register Services
builder.Services.AddSingleton<ArenaOps.CoreService.Application.Interfaces.IDapperContext, ArenaOps.CoreService.Infrastructure.Data.DapperContext>();

// Repositories
builder.Services.AddScoped<ArenaOps.CoreService.Application.Interfaces.ISeatingPlanRepository, ArenaOps.CoreService.Infrastructure.Repositories.SeatingPlanRepository>();
builder.Services.AddScoped<ArenaOps.CoreService.Application.Interfaces.IStadiumRepository, ArenaOps.CoreService.Infrastructure.Repositories.StadiumRepository>();

// Services
builder.Services.AddScoped<ArenaOps.CoreService.Application.Interfaces.ISeatingPlanService, ArenaOps.CoreService.Infrastructure.Services.SeatingPlanService>();
builder.Services.AddScoped<ArenaOps.CoreService.Application.Interfaces.IStadiumService, ArenaOps.CoreService.Infrastructure.Services.StadiumService>();

// 3a. Register EF Core DbContext
builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3b. Configure Authentication (Using local RSA public key)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var rsa = RSA.Create();
        var keyPath = Path.Combine(builder.Environment.ContentRootPath, "Keys", "rsa-public.key");

        if (File.Exists(keyPath))
        {
            var keyPem = File.ReadAllText(keyPath);
            rsa.ImportFromPem(keyPem);
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "ArenaOps",
            ValidateAudience = true,
            ValidAudience = "ArenaOps",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new RsaSecurityKey(rsa),
            ClockSkew = TimeSpan.Zero
        };
    });

// 3c. Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("StadiumOwner", policy => policy.RequireRole("StadiumOwner"));
});

// 3d. Controllers
builder.Services.AddControllers();

// 4. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString!, name: "SQL Server");

// 5. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// 6. Configure the HTTP request pipeline.
app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

// 7. Map Endpoints
app.MapHealthChecks("/health");
app.MapGet("/", () => "ArenaOps CoreService API is running.");
app.MapControllers();

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
