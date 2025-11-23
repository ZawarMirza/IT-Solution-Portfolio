using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ProductAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ProductAPI.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();

            try
            {
                // Ensure the database is created and all migrations are applied
                await context.Database.EnsureCreatedAsync();

                // Create default roles if they don't exist
                string[] roles = { "Admin", "User", "Guest" };

                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole(role));
                    }
                }

                // Create super admin user if it doesn't exist
                // NOTE: When you run the application, this super admin will be created automatically
                // Super Admin Credentials:
                // Email: admin@example.com
                // Password: Admin@123
                // IMPORTANT: Change this password in production!
                string adminEmail = "admin@example.com";
                string adminPassword = "Admin@123";

                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FirstName = "Admin",
                        LastName = "User",
                        EmailConfirmed = true,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(adminUser, adminPassword);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        
                        // Display super admin credentials in terminal using Console.WriteLine for visibility
                        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                        Console.WriteLine("");
                        Console.WriteLine("==========================================");
                        Console.WriteLine("SUPER ADMIN CREATED SUCCESSFULLY!");
                        Console.WriteLine("==========================================");
                        Console.WriteLine($"Email: {adminEmail}");
                        Console.WriteLine($"Password: {adminPassword}");
                        Console.WriteLine("Role: Admin");
                        Console.WriteLine("==========================================");
                        Console.WriteLine("⚠️  IMPORTANT: Change this password in production!");
                        Console.WriteLine("==========================================");
                        Console.WriteLine("");
                        
                        // Also log using logger
                        logger.LogInformation("");
                        logger.LogInformation("==========================================");
                        logger.LogInformation("SUPER ADMIN CREATED SUCCESSFULLY!");
                        logger.LogInformation("==========================================");
                        logger.LogInformation("Email: {Email}", adminEmail);
                        logger.LogInformation("Password: {Password}", adminPassword);
                        logger.LogInformation("Role: Admin");
                        logger.LogInformation("==========================================");
                        logger.LogInformation("⚠️  IMPORTANT: Change this password in production!");
                        logger.LogInformation("==========================================");
                        logger.LogInformation("");
                    }
                    else
                    {
                        // Log the errors if user creation fails
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        throw new Exception($"Failed to create admin user: {errors}");
                    }
                }
                else
                {
                    // Display existing super admin credentials
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                    
                    // Ensure admin user has Admin role (in case it was removed)
                    var userRoles = await userManager.GetRolesAsync(adminUser);
                    if (!userRoles.Contains("Admin"))
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation("Added Admin role to existing admin user");
                    }
                    
                    var currentRoles = await userManager.GetRolesAsync(adminUser);
                    Console.WriteLine("");
                    Console.WriteLine("==========================================");
                    Console.WriteLine("SUPER ADMIN CREDENTIALS");
                    Console.WriteLine("==========================================");
                    Console.WriteLine($"Email: {adminEmail}");
                    Console.WriteLine($"Password: {adminPassword}");
                    Console.WriteLine($"Roles: {string.Join(", ", currentRoles)}");
                    Console.WriteLine("Status: Already exists");
                    Console.WriteLine("==========================================");
                    Console.WriteLine("⚠️  IMPORTANT: Change this password in production!");
                    Console.WriteLine("==========================================");
                    Console.WriteLine("");
                    
                    // Also log using logger
                    logger.LogInformation("");
                    logger.LogInformation("==========================================");
                    logger.LogInformation("SUPER ADMIN CREDENTIALS");
                    logger.LogInformation("==========================================");
                    logger.LogInformation("Email: {Email}", adminEmail);
                    logger.LogInformation("Password: {Password}", adminPassword);
                    logger.LogInformation("Roles: {Roles}", string.Join(", ", currentRoles));
                    logger.LogInformation("Status: Already exists");
                    logger.LogInformation("==========================================");
                    logger.LogInformation("⚠️  IMPORTANT: Change this password in production!");
                    logger.LogInformation("==========================================");
                    logger.LogInformation("");
                }

                // Note: Regular users are created through the registration flow with email verification
                // No default user is created - users must register and verify their email
            }
            catch (Exception ex)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while initializing the database.");
                throw;
            }
        }
    }
}
