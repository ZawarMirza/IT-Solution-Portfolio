using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddControllers();

// Add Identity
builder.Services.AddIdentity<ProductAPI.Models.User, IdentityRole>(options =>
{
    // Remove password complexity requirements
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 1; // Minimum length set to 1
})
    .AddEntityFrameworkStores<ProductDbContext>()
    .AddDefaultTokenProviders();

// Add Authentication

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.")))
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Add a method to update CreatedAt for existing users on startup
async Task UpdateExistingUsersCreatedAt(UserManager<ProductAPI.Models.User> userManager)
{
    var users = await userManager.Users.ToListAsync();
    int updatedCount = 0;

    foreach (var user in users)
    {
        if (user.CreatedAt == default(DateTime) || user.CreatedAt.Year == 1)
        {
            user.CreatedAt = DateTime.UtcNow; // Set to current time as a placeholder for existing users
            var result = await userManager.UpdateAsync(user);
            if (result.Succeeded)
                updatedCount++;
        }
    }

    Console.WriteLine($"Updated CreatedAt for {updatedCount} users on startup.");
}

// Add a method to update CreatedAt for existing products on startup
async Task UpdateExistingProductsCreatedAt(ProductDbContext dbContext)
{
    var products = await dbContext.Products.ToListAsync();
    int updatedCount = 0;

    foreach (var product in products)
    {
        if (product.CreatedAt == default(DateTime) || product.CreatedAt.Year == 1)
        {
            product.CreatedAt = DateTime.UtcNow; // Set to current time as a placeholder for existing products
            dbContext.Update(product);
            updatedCount++;
        }
        // Do not set CreatedById to avoid foreign key issues during startup
    }

    await dbContext.SaveChangesAsync();
    Console.WriteLine($"Updated CreatedAt for {updatedCount} products on startup.");
}

// Add a method to update CreatedById for existing products without a creator
async Task UpdateExistingProductsCreatedById(ProductDbContext dbContext)
{
    var firstUser = await dbContext.Users.FirstOrDefaultAsync();
    if (firstUser == null)
    {
        Console.WriteLine("No users found to assign as creator for products.");
        return;
    }

    var products = await dbContext.Products
        .Where(p => p.CreatedById == null || p.CreatedById == "")
        .ToListAsync();
    int updatedCount = 0;

    foreach (var product in products)
    {
        product.CreatedById = firstUser.Id;
        dbContext.Update(product);
        updatedCount++;
    }

    await dbContext.SaveChangesAsync();
    Console.WriteLine($"Updated CreatedById for {updatedCount} products on startup.");
}

// Call the methods on startup using the service provider
using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ProductAPI.Models.User>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    await UpdateExistingUsersCreatedAt(userManager);
    await UpdateExistingProductsCreatedAt(dbContext);
    await UpdateExistingProductsCreatedById(dbContext); // Call the new method
}

app.Run();
