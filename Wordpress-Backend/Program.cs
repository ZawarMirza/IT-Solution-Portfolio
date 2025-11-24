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
using Microsoft.Data.Sqlite;

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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to handle camelCase from frontend
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

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
        ClockSkew = TimeSpan.Zero,
        // Configure role claim type to match what Identity uses
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.Name
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
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
builder.Services.AddSingleton<EmailTemplateService>(sp => new EmailTemplateService(frontendUrl));

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
        var logger = services.GetRequiredService<ILogger<Program>>();
        
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
            
            // Check and add BlockReason
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='BlockReason'";
            var blockReasonExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (blockReasonExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN BlockReason TEXT";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Added BlockReason column to AspNetUsers table");
            }
            
            // Check and add BlockedAt
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='BlockedAt'";
            var blockedAtExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (blockedAtExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN BlockedAt TEXT";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Added BlockedAt column to AspNetUsers table");
            }
            
            // Check and add BlockedBy
            command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('AspNetUsers') WHERE name='BlockedBy'";
            var blockedByExists = Convert.ToInt32(await command.ExecuteScalarAsync());
            if (blockedByExists == 0)
            {
                command.CommandText = "ALTER TABLE AspNetUsers ADD COLUMN BlockedBy TEXT";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Added BlockedBy column to AspNetUsers table");
            }
            
            // Check and add ThumbnailUrl to Repositories table if it exists
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Repositories'";
            var reposTableExists = await command.ExecuteScalarAsync();
            if (reposTableExists != null)
            {
                command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('Repositories') WHERE name='ThumbnailUrl'";
                var thumbnailExists = Convert.ToInt32(await command.ExecuteScalarAsync());
                if (thumbnailExists == 0)
                {
                    command.CommandText = "ALTER TABLE Repositories ADD COLUMN ThumbnailUrl TEXT";
                    await command.ExecuteNonQueryAsync();
                    logger.LogInformation("Added ThumbnailUrl column to Repositories table");
                    Console.WriteLine("[Database Init] Added ThumbnailUrl column to Repositories table");
                }
            }
            
            // Create PremiumRepositoryRequests table if it doesn't exist
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='PremiumRepositoryRequests'";
            var premiumRequestsTableExists = await command.ExecuteScalarAsync();
            if (premiumRequestsTableExists == null)
            {
                command.CommandText = @"
                    CREATE TABLE PremiumRepositoryRequests (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId TEXT NOT NULL,
                        RepositoryId INTEGER NOT NULL,
                        Message TEXT,
                        Status TEXT NOT NULL DEFAULT 'pending',
                        AdminNotes TEXT,
                        ApprovedBy TEXT,
                        RequestedAt TEXT NOT NULL,
                        ReviewedAt TEXT,
                        FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id),
                        FOREIGN KEY (RepositoryId) REFERENCES Repositories(Id)
                    )";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Created PremiumRepositoryRequests table");
                Console.WriteLine("[Database Init] Created PremiumRepositoryRequests table");
            }
            
            // Create Reviews table if it doesn't exist
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Reviews'";
            var reviewsTableExists = await command.ExecuteScalarAsync();
            if (reviewsTableExists == null)
            {
                command.CommandText = @"
                    CREATE TABLE Reviews (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId TEXT NOT NULL,
                        RepositoryId INTEGER NOT NULL,
                        Rating INTEGER NOT NULL,
                        Comment TEXT,
                        CreatedAt TEXT NOT NULL,
                        UpdatedAt TEXT,
                        FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id),
                        FOREIGN KEY (RepositoryId) REFERENCES Repositories(Id),
                        UNIQUE(UserId, RepositoryId)
                    )";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Created Reviews table");
                Console.WriteLine("[Database Init] Created Reviews table");
            }
            
            // Create Feedbacks table if it doesn't exist
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Feedbacks'";
            var feedbacksTableExists = await command.ExecuteScalarAsync();
            if (feedbacksTableExists == null)
            {
                command.CommandText = @"
                    CREATE TABLE Feedbacks (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        FirstName TEXT NOT NULL,
                        LastName TEXT NOT NULL,
                        WorkEmail TEXT NOT NULL,
                        CompanyName TEXT NOT NULL,
                        Country TEXT NOT NULL,
                        HowCanWeHelp TEXT NOT NULL,
                        ProductServiceInterest TEXT NOT NULL,
                        HowDidYouHearAboutUs TEXT NOT NULL,
                        ConsentGiven INTEGER NOT NULL,
                        SubmittedAt TEXT NOT NULL,
                        IsRead INTEGER NOT NULL DEFAULT 0,
                        ReadAt TEXT,
                        ReadBy TEXT
                    )";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Created Feedbacks table");
                Console.WriteLine("[Database Init] Created Feedbacks table");
            }
            
            // Create FooterSettings table if it doesn't exist
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='FooterSettings'";
            var footerSettingsTableExists = await command.ExecuteScalarAsync();
            if (footerSettingsTableExists == null)
            {
                command.CommandText = @"
                    CREATE TABLE FooterSettings (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        CompanyName TEXT,
                        CompanyLogoUrl TEXT,
                        Address TEXT,
                        Phone TEXT,
                        Email TEXT,
                        MapLocationUrl TEXT,
                        LinkedInUrl TEXT,
                        LinkedInVisible INTEGER NOT NULL DEFAULT 1,
                        FacebookUrl TEXT,
                        FacebookVisible INTEGER NOT NULL DEFAULT 1,
                        TwitterUrl TEXT,
                        TwitterVisible INTEGER NOT NULL DEFAULT 1,
                        TikTokUrl TEXT,
                        TikTokVisible INTEGER NOT NULL DEFAULT 1,
                        YouTubeUrl TEXT,
                        YouTubeVisible INTEGER NOT NULL DEFAULT 1,
                        WhatsAppUrl TEXT,
                        WhatsAppVisible INTEGER NOT NULL DEFAULT 1,
                        FooterLinksJson TEXT,
                        CopyrightText TEXT,
                        UpdatedAt TEXT NOT NULL,
                        UpdatedBy TEXT
                    )";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Created FooterSettings table");
                Console.WriteLine("[Database Init] Created FooterSettings table");
            }

            // Create Solutions table if it doesn't exist
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Solutions'";
            var solutionsTableExists = await command.ExecuteScalarAsync();
            if (solutionsTableExists == null)
            {
                command.CommandText = @"
                    CREATE TABLE Solutions (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Title TEXT NOT NULL,
                        Subtitle TEXT,
                        Description TEXT,
                        ImageUrl TEXT,
                        ActionText TEXT,
                        ActionUrl TEXT,
                        IsFeatured INTEGER NOT NULL DEFAULT 0,
                        Tags TEXT,
                        Features TEXT,
                        DomainId INTEGER NOT NULL,
                        CreatedAt TEXT NOT NULL,
                        UpdatedAt TEXT,
                        CreatedById TEXT,
                        FOREIGN KEY (DomainId) REFERENCES Domains(Id) ON DELETE RESTRICT,
                        FOREIGN KEY (CreatedById) REFERENCES AspNetUsers(Id) ON DELETE SET NULL
                    )";
                await command.ExecuteNonQueryAsync();
                logger.LogInformation("Created Solutions table");
                Console.WriteLine("[Database Init] Created Solutions table");
            }
            
            await connection.CloseAsync();
        }
        catch (Exception columnEx)
        {
            // If column addition fails, log but continue
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
