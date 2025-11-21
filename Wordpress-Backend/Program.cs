using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using ProductAPI.Models;
using Wordpress_Backend.Services.Email;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext with SQLite
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"),
    b => b.MigrationsAssembly("Wordpress-Backend")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Pagination");
    });
});

builder.Services.AddControllers();

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 1;
    
    // User settings
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<ProductDbContext>()
    .AddDefaultTokenProviders();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidIssuer = builder.Configuration["Jwt:ValidIssuer"] ?? throw new InvalidOperationException("JWT ValidIssuer is not configured"),
        ValidAudience = builder.Configuration["Jwt:ValidAudience"] ?? throw new InvalidOperationException("JWT ValidAudience is not configured"),
        ClockSkew = TimeSpan.Zero
    };
});

// Add Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => 
        policy.RequireRole("Admin"));
    
    options.AddPolicy("RequireUserRole", policy => 
        policy.RequireRole("User", "Admin"));
});

// Add Email Service
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// Serve static files from wwwroot (for uploaded images, etc.)
app.UseStaticFiles();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Initialize the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ProductDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        
        // Ensure database is created (this will create tables if they don't exist)
        await context.Database.EnsureCreatedAsync();
        
        // Manually add verification columns if they don't exist (for SQLite)
        try
        {
            var connection = context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            
            // Check and add VerificationTokenHash
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='VerificationTokenHash'";
            var hashExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (hashExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenHash TEXT";
                await command.ExecuteNonQueryAsync();
            }
            
            // Check and add VerificationTokenExpiresAt
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='VerificationTokenExpiresAt'";
            var expiresExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (expiresExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenExpiresAt TEXT";
                await command.ExecuteNonQueryAsync();
            }
            
            // Check and add EmailVerifiedAt
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='EmailVerifiedAt'";
            var verifiedExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (verifiedExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN EmailVerifiedAt TEXT";
                await command.ExecuteNonQueryAsync();
            }
            
            // Check and add LastVerificationEmailSentAt
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='LastVerificationEmailSentAt'";
            var sentExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (sentExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN LastVerificationEmailSentAt TEXT";
                await command.ExecuteNonQueryAsync();
            }
            
            await connection.CloseAsync();
        }
        catch (Exception columnEx)
        {
            // If column addition fails, log but continue
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(columnEx, "Warning adding verification columns (they may already exist)");
        }
        
        // Try to apply migrations if any exist
        try
        {
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            if (pendingMigrations.Any())
            {
                await context.Database.MigrateAsync();
            }
        }
        catch (Exception migrationEx)
        {
            // If migration fails, log but continue (database might already be up to date)
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(migrationEx, "Migration warning (this is usually safe to ignore if database is already up to date)");
        }
        
        // Seed the database
        await DbInitializer.Initialize(services);
        
        // Log completion
        var initLogger = services.GetRequiredService<ILogger<Program>>();
        initLogger.LogInformation("Database initialization completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");
        // Don't throw the exception to prevent server crash
    }
}

app.Run();
