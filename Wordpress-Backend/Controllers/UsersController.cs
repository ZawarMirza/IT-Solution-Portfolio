using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Models;
using System.Security.Claims;
using Wordpress_Backend.Services.Email;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _emailTemplateService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager,
            IEmailSender emailSender,
            EmailTemplateService emailTemplateService,
            IConfiguration configuration,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
            _emailTemplateService = emailTemplateService;
            _configuration = configuration;
            _logger = logger;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            // Debug: Log user identity and roles
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isInRole = User.IsInRole("Admin");
            
            Console.WriteLine($"[GetUsers] User ID: {userId}");
            Console.WriteLine($"[GetUsers] User Name: {userName}");
            Console.WriteLine($"[GetUsers] User Email: {userEmail}");
            Console.WriteLine($"[GetUsers] Roles in token: {string.Join(", ", userRoles)}");
            Console.WriteLine($"[GetUsers] IsInRole('Admin'): {isInRole}");
            Console.WriteLine($"[GetUsers] All claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
            
            if (!isInRole)
            {
                return StatusCode(403, new { 
                    message = "Access denied. Admin role required.",
                    userId = userId,
                    userName = userName,
                    roles = userRoles,
                    allClaims = User.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList()
                });
            }
            
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    isBlocked = user.IsBlocked,
                    blockReason = user.BlockReason,
                    blockedAt = user.BlockedAt,
                    blockedBy = user.BlockedBy,
                    createdAt = user.CreatedAt,
                    lastLogin = user.LastLogin,
                    roles = roles
                });
            }

            return Ok(userList);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                isBlocked = user.IsBlocked,
                createdAt = user.CreatedAt,
                lastLogin = user.LastLogin,
                roles = roles
            });
        }

        // PUT: api/Users/5/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Remove all existing roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Add new role
            if (!string.IsNullOrEmpty(request.Role))
            {
                var roleExists = await _roleManager.RoleExistsAsync(request.Role);
                if (!roleExists)
                {
                    return BadRequest($"Role '{request.Role}' does not exist.");
                }

                await _userManager.AddToRoleAsync(user, request.Role);
            }

            return Ok(new { message = "User role updated successfully" });
        }

        // PUT: api/Users/5/block
        [HttpPut("{id}/block")]
        public async Task<IActionResult> BlockUser(string id, [FromBody] BlockUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Get the admin user who is blocking
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminUser = adminUserId != null ? await _userManager.FindByIdAsync(adminUserId) : null;
            var adminEmail = adminUser?.Email ?? "Administrator";

            // Update user blocking status
            user.IsBlocked = true;
            user.BlockReason = request?.Reason ?? "No reason provided";
            user.BlockedAt = DateTime.UtcNow;
            user.BlockedBy = adminUserId;
            
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                // Send email notification to the blocked user
                try
                {
                    var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                    var contactEmail = _configuration["EmailSettings:FromEmail"] ?? "support@example.com";
                    
                    var emailBody = _emailTemplateService.GenerateUserBlockedEmail(
                        user.FirstName ?? "User",
                        user.BlockReason ?? "No reason provided",
                        contactEmail
                    );

                    await _emailSender.SendEmailAsync(
                        user.Email,
                        "Your Account Has Been Blocked - IT Solution Portfolio",
                        emailBody
                    );

                    _logger.LogInformation("Block notification email sent to {Email} for user {UserId}. Reason: {Reason}", 
                        user.Email, user.Id, user.BlockReason);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send block notification email to {Email}", user.Email);
                    // Don't fail the block operation if email fails
                }

                return Ok(new { message = "User blocked successfully" });
            }

            return BadRequest(result.Errors);
        }

        // PUT: api/Users/5/unblock
        [HttpPut("{id}/unblock")]
        public async Task<IActionResult> UnblockUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var previousBlockReason = user.BlockReason;
            
            // Clear blocking information
            user.IsBlocked = false;
            user.BlockReason = null;
            user.BlockedAt = null;
            user.BlockedBy = null;
            
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                // Send email notification to the unblocked user
                try
                {
                    var emailBody = _emailTemplateService.GenerateUserUnblockedEmail(
                        user.FirstName ?? "User"
                    );

                    await _emailSender.SendEmailAsync(
                        user.Email,
                        "Your Account Has Been Unblocked - IT Solution Portfolio",
                        emailBody
                    );

                    _logger.LogInformation("Unblock notification email sent to {Email} for user {UserId}", 
                        user.Email, user.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send unblock notification email to {Email}", user.Email);
                    // Don't fail the unblock operation if email fails
                }

                return Ok(new { message = "User unblocked successfully" });
            }

            return BadRequest(result.Errors);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { message = "User deleted successfully" });
            }

            return BadRequest(result.Errors);
        }

        // GET: api/Users/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<string>>> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }

        // GET: api/Users/debug
        [HttpGet("debug")]
        [Authorize] // Allow any authenticated user to check their token
        public ActionResult<object> GetDebugInfo()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isInRole = User.IsInRole("Admin");
            var allClaims = User.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList();
            
            return Ok(new
            {
                userId,
                userName,
                userEmail,
                roles,
                isInRole,
                isAdmin = isInRole,
                allClaims,
                message = "Token debug information"
            });
        }

        // GET: api/Users/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetUserStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var blockedUsers = await _userManager.Users.CountAsync(u => u.IsBlocked);
            var activeUsers = totalUsers - blockedUsers;

            var adminCount = 0;
            var userCount = 0;
            var guestCount = 0;

            var users = await _userManager.Users.ToListAsync();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Admin"))
                    adminCount++;
                else if (roles.Contains("User"))
                    userCount++;
                else
                    guestCount++;
            }

            return Ok(new
            {
                totalUsers,
                activeUsers,
                blockedUsers,
                adminCount,
                userCount,
                guestCount
            });
        }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; }
    }

    public class BlockUserRequest
    {
        public string? Reason { get; set; }
    }
}
