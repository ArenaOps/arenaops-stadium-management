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

// 4. Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwksUrl = jwtSettings.GetValue<string>("JwksUrl")!;

// Pre-fetch the RSA key from AuthService JWKS
// Note: In production, you'd want to handle key rotation and cache the key
var client = new HttpClient();
var jwksJson = client.GetStringAsync(jwksUrl).GetAwaiter().GetResult();
var jwks = new Microsoft.IdentityModel.Tokens.JsonWebKeySet(jwksJson);
var signingKey = jwks.Keys[0]; // Take the first key (RS256)

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidateAudience = true,
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.FromMinutes(1)
    };

    options.RequireHttpsMetadata = false;
    
    // Cookie support (optional, matching AuthService pattern)
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (string.IsNullOrEmpty(context.Token) &&
                context.Request.Cookies.TryGetValue("accessToken", out var cookieToken))
            {
                context.Token = cookieToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// 5. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString!, name: "SQL Server");

// 6. CORS
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

// 7. Configure the HTTP request pipeline.
app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();


// 6. Map Health Check endpoint
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
