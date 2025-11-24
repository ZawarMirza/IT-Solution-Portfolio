using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using Wordpress_Backend.Models;
using System.Text.Json;
using System.Security.Claims;
using System.Linq;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepositoriesController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public RepositoriesController(ProductDbContext context)
        {
            _context = context;
        }

        // GET: api/Repositories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Repository>>> GetRepositories()
        {
            try
            {
                // Check if the table exists
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    Console.WriteLine("[GetRepositories] Cannot connect to database");
                    return StatusCode(500, new { message = "Cannot connect to database" });
                }

                // Check if Repositories table exists (EF Core might use different naming)
                try
                {
                    var connection = _context.Database.GetDbConnection();
                    await connection.OpenAsync();
                    using var command = connection.CreateCommand();
                    
                    // Check for both possible table names
                    command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND (name='Repositories' OR name='repositories')";
                    var tableExists = await command.ExecuteScalarAsync();
                    
                    if (tableExists == null)
                    {
                        Console.WriteLine("[GetRepositories] Repositories table does not exist. Attempting to create...");
                        await connection.CloseAsync();
                        
                        // Try to ensure the database is created
                        await _context.Database.EnsureCreatedAsync();
                        
                        // Verify table was created
                        await connection.OpenAsync();
                        command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND (name='Repositories' OR name='repositories')";
                        tableExists = await command.ExecuteScalarAsync();
                        
                        if (tableExists == null)
                        {
                            Console.WriteLine("[GetRepositories] Table still does not exist after EnsureCreated. Returning empty list.");
                            await connection.CloseAsync();
                            return Ok(new List<Repository>());
                        }
                        else
                        {
                            Console.WriteLine($"[GetRepositories] Table created successfully: {tableExists}");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"[GetRepositories] Table exists: {tableExists}");
                    }
                    
                    await connection.CloseAsync();
                }
                catch (Exception tableCheckEx)
                {
                    Console.WriteLine($"[GetRepositories] Error checking/creating table: {tableCheckEx.Message}");
                    Console.WriteLine($"[GetRepositories] Exception type: {tableCheckEx.GetType().Name}");
                    if (tableCheckEx.InnerException != null)
                    {
                        Console.WriteLine($"[GetRepositories] Inner exception: {tableCheckEx.InnerException.Message}");
                    }
                    // Continue to try the query anyway - it might work
                }

                // Check if ThumbnailUrl column exists, if not add it
                try
                {
                    var connection = _context.Database.GetDbConnection();
                    await connection.OpenAsync();
                    using var command = connection.CreateCommand();
                    
                    command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('Repositories') WHERE name='ThumbnailUrl'";
                    var thumbnailExists = Convert.ToInt32(await command.ExecuteScalarAsync());
                    if (thumbnailExists == 0)
                    {
                        Console.WriteLine("[GetRepositories] ThumbnailUrl column missing, adding it...");
                        command.CommandText = "ALTER TABLE Repositories ADD COLUMN ThumbnailUrl TEXT";
                        await command.ExecuteNonQueryAsync();
                        Console.WriteLine("[GetRepositories] ThumbnailUrl column added successfully");
                    }
                    await connection.CloseAsync();
                }
                catch (Exception colEx)
                {
                    Console.WriteLine($"[GetRepositories] Error checking/adding ThumbnailUrl column: {colEx.Message}");
                    // Continue anyway - the query might still work
                }

                var repositories = await _context.Repositories
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();
                
                Console.WriteLine($"[GetRepositories] Successfully retrieved {repositories.Count} repositories");
                return Ok(repositories);
            }
            catch (SqliteException sqlEx)
            {
                // SQLite specific errors
                Console.WriteLine($"[GetRepositories] SQLite Error: {sqlEx.Message}");
                Console.WriteLine($"[GetRepositories] SQLite Error Code: {sqlEx.SqliteErrorCode}");
                Console.WriteLine($"[GetRepositories] SQLite Extended Error Code: {sqlEx.SqliteExtendedErrorCode}");
                Console.WriteLine($"[GetRepositories] SQLite StackTrace: {sqlEx.StackTrace}");
                
                // If table doesn't exist, try to create it and return empty list
                if (sqlEx.SqliteErrorCode == 1 || sqlEx.Message.Contains("no such table") || sqlEx.Message.Contains("Repositories"))
                {
                    try
                    {
                        Console.WriteLine("[GetRepositories] Table missing error detected. Attempting to ensure database is created...");
                        await _context.Database.EnsureCreatedAsync();
                        Console.WriteLine("[GetRepositories] Database ensured. Returning empty list (table will be created on first insert).");
                        return Ok(new List<Repository>());
                    }
                    catch (Exception ensureEx)
                    {
                        Console.WriteLine($"[GetRepositories] Error ensuring table exists: {ensureEx.Message}");
                        Console.WriteLine($"[GetRepositories] Ensure exception type: {ensureEx.GetType().Name}");
                        if (ensureEx.InnerException != null)
                        {
                            Console.WriteLine($"[GetRepositories] Ensure inner exception: {ensureEx.InnerException.Message}");
                        }
                        // Return empty list anyway so the page can render
                        return Ok(new List<Repository>());
                    }
                }
                
                // For other SQLite errors, return detailed error
                return StatusCode(500, new { 
                    message = "Database error occurred", 
                    error = sqlEx.Message,
                    errorCode = sqlEx.SqliteErrorCode.ToString(),
                    extendedErrorCode = sqlEx.SqliteExtendedErrorCode.ToString(),
                    hint = "Check backend console for detailed error logs"
                });
            }
            catch (Exception ex)
            {
                // Log the error with full details
                Console.WriteLine($"[GetRepositories] Error: {ex.Message}");
                Console.WriteLine($"[GetRepositories] Error Type: {ex.GetType().Name}");
                Console.WriteLine($"[GetRepositories] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[GetRepositories] InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"[GetRepositories] InnerException Type: {ex.InnerException.GetType().Name}");
                }
                
                // Check if it's a table doesn't exist error
                if (ex.Message.Contains("no such table") || ex.Message.Contains("Repositories"))
                {
                    try
                    {
                        // Try to ensure the database is created
                        await _context.Database.EnsureCreatedAsync();
                        // Return empty list if table still doesn't exist
                        return Ok(new List<Repository>());
                    }
                    catch (Exception ensureEx)
                    {
                        Console.WriteLine($"[GetRepositories] Error ensuring database: {ensureEx.Message}");
                    }
                }
                
                return StatusCode(500, new { 
                    message = "An error occurred while fetching repositories", 
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    details = ex.InnerException?.Message 
                });
            }
        }

        // GET: api/Repositories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Repository>> GetRepository(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);

            if (repository == null)
            {
                return NotFound();
            }

            return repository;
        }

        // POST: api/Repositories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Repository>> PostRepository(Repository repository)
        {
            // Log received data for debugging
            Console.WriteLine($"[PostRepository] ===== RECEIVED DATA =====");
            Console.WriteLine($"[PostRepository] Name: {repository.Name}");
            Console.WriteLine($"[PostRepository] Description: {repository.Description?.Substring(0, Math.Min(50, repository.Description?.Length ?? 0))}...");
            Console.WriteLine($"[PostRepository] Domain: {repository.Domain}");
            Console.WriteLine($"[PostRepository] Category: {repository.Category}");
            Console.WriteLine($"[PostRepository] GitHubUrl: {repository.GitHubUrl}");
            Console.WriteLine($"[PostRepository] DownloadUrl: {repository.DownloadUrl}");
            Console.WriteLine($"[PostRepository] DocumentPreviewUrl: {repository.DocumentPreviewUrl}");
            Console.WriteLine($"[PostRepository] ThumbnailUrl: {repository.ThumbnailUrl}");
            Console.WriteLine($"[PostRepository] LicenseType: {repository.LicenseType}");
            Console.WriteLine($"[PostRepository] Version: {repository.Version}");
            Console.WriteLine($"[PostRepository] Technologies: {repository.Technologies}");
            Console.WriteLine($"[PostRepository] AccessLevel: {repository.AccessLevel}");
            Console.WriteLine($"[PostRepository] Stars: {repository.Stars}");
            Console.WriteLine($"[PostRepository] Forks: {repository.Forks}");
            Console.WriteLine($"[PostRepository] Downloads: {repository.Downloads}");
            Console.WriteLine($"[PostRepository] Status: {repository.Status}");
            Console.WriteLine($"[PostRepository] =========================");
            
            // Ensure ThumbnailUrl column exists before saving
            try
            {
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                using var command = connection.CreateCommand();
                
                command.CommandText = "SELECT COUNT(*) FROM pragma_table_info('Repositories') WHERE name='ThumbnailUrl'";
                var thumbnailExists = Convert.ToInt32(await command.ExecuteScalarAsync());
                if (thumbnailExists == 0)
                {
                    Console.WriteLine("[PostRepository] ThumbnailUrl column missing, adding it...");
                    command.CommandText = "ALTER TABLE Repositories ADD COLUMN ThumbnailUrl TEXT";
                    await command.ExecuteNonQueryAsync();
                    Console.WriteLine("[PostRepository] ThumbnailUrl column added successfully");
                }
                await connection.CloseAsync();
            }
            catch (Exception colEx)
            {
                Console.WriteLine($"[PostRepository] Error checking/adding ThumbnailUrl column: {colEx.Message}");
                // Continue anyway
            }
            
            // Set required fields if not provided
            if (string.IsNullOrEmpty(repository.Status))
            {
                repository.Status = "active";
            }
            if (string.IsNullOrEmpty(repository.Category))
            {
                repository.Category = "Free";
            }
            if (string.IsNullOrEmpty(repository.AccessLevel))
            {
                repository.AccessLevel = "public";
            }
            if (string.IsNullOrEmpty(repository.Technologies))
            {
                repository.Technologies = "[]";
            }
            
            repository.CreatedAt = DateTime.UtcNow;
            repository.LastUpdated = DateTime.UtcNow;
            repository.CreatedBy = User?.Identity?.Name ?? "System";

            _context.Repositories.Add(repository);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[PostRepository] Repository created successfully with ID: {repository.Id}");
            Console.WriteLine($"[PostRepository] All data saved to database");
            return CreatedAtAction("GetRepository", new { id = repository.Id }, repository);
        }

        // PUT: api/Repositories/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutRepository(int id, Repository repository)
        {
            if (id != repository.Id)
            {
                return BadRequest();
            }

            repository.LastUpdated = DateTime.UtcNow;
            _context.Entry(repository).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RepositoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Repositories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRepository(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);
            if (repository == null)
            {
                return NotFound();
            }

            // Remove dependent premium access requests first to avoid FK constraint issues
            var relatedRequests = await _context.PremiumRepositoryRequests
                .Where(r => r.RepositoryId == id)
                .ToListAsync();

            if (relatedRequests.Count > 0)
            {
                _context.PremiumRepositoryRequests.RemoveRange(relatedRequests);
            }

            _context.Repositories.Remove(repository);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Repositories/5/download
        [HttpPost("{id}/download")]
        [Authorize]
        public async Task<IActionResult> IncrementDownload(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);
            if (repository == null)
            {
                return NotFound();
            }

            repository.Downloads++;
            await _context.SaveChangesAsync();

            return Ok(new { downloads = repository.Downloads });
        }

        // GET: api/Repositories/domains
        [HttpGet("domains")]
        public async Task<ActionResult<IEnumerable<string>>> GetDomains()
        {
            var domains = await _context.Repositories
                .Select(r => r.Domain)
                .Distinct()
                .ToListAsync();

            return Ok(domains);
        }

        // GET: api/Repositories/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _context.Repositories
                .Select(r => r.Category)
                .Distinct()
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Repositories/debug/user-info
        [HttpGet("debug/user-info")]
        [Authorize]
        public IActionResult GetUserInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userName = User.Identity?.Name;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isInRole = User.IsInRole("Admin");
            var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            
            Console.WriteLine($"[GetUserInfo] User: {userEmail}, Roles: {string.Join(", ", roles)}, IsInRole('Admin'): {isInRole}");
            
            return Ok(new
            {
                userId,
                userEmail,
                userName,
                roles,
                isInRole,
                allClaims,
                isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                roleClaimType = ClaimTypes.Role,
                hasAdminRole = roles.Contains("Admin") || isInRole
            });
        }
        
        // GET: api/Repositories/debug/test-admin
        [HttpGet("debug/test-admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult TestAdminAccess()
        {
            return Ok(new { 
                message = "Admin access confirmed!",
                user = User.Identity?.Name,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
            });
        }

        private bool RepositoryExists(int id)
        {
            return _context.Repositories.Any(e => e.Id == id);
        }
    }
}
