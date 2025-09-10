using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProductAPI.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ProductAPI.Data;
using System.Linq;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly ProductDbContext _context;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            ProductDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [Route("register")] // Explicit route
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Assign default role to new users
                await _userManager.AddToRoleAsync(user, "User");
                
                // Auto-login after registration to match frontend expectations
                var roles = await _userManager.GetRolesAsync(user);
                var userClaims = await _userManager.GetClaimsAsync(user);
                
                var roleClaims = new List<Claim>();
                foreach (var role in roles)
                {
                    roleClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                    new Claim(JwtRegisteredClaimNames.Name, user.UserName ?? string.Empty),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                }
                .Union(userClaims)
                .Union(roleClaims);

                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "ThisIsASecretKeyForJwtTokenGeneration1234567890"));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:ValidIssuer"],
                    audience: _configuration["Jwt:ValidAudience"],
                    expires: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpireInMinutes", 60)),
                    claims: claims,
                    signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                
                return Ok(new 
                { 
                    token = tokenString,
                    refreshToken = tokenString, // For now, using same token as refresh token
                    user = new 
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        role = roles.FirstOrDefault() ?? "User"
                    },
                    message = "User registered successfully."
                });
            }

            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);

            return BadRequest(ModelState);
        }

        // POST: api/auth/signup (keeping for backward compatibility)
        [HttpPost("signup")]
        [Route("signup")] // Explicit route
        [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger
        public async Task<IActionResult> Signup([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Assign default role to new users
                await _userManager.AddToRoleAsync(user, "User");
                return Ok(new { message = "User created successfully." });
            }

            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);

            return BadRequest(ModelState);
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized("Invalid credentials.");

            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            
            var roleClaims = new List<Claim>();
            var permissionClaims = new List<Claim>();

            foreach (var role in roles)
            {
                roleClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }
            .Union(userClaims)
            .Union(roleClaims)
            .Union(permissionClaims);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "ThisIsASecretKeyForJwtTokenGeneration1234567890"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:ValidIssuer"],
                audience: _configuration["Jwt:ValidAudience"],
                expires: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpireInMinutes", 60)),
                claims: claims,
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation("JWT Token generated for user {UserId}", user.Id);
            _logger.LogDebug("JWT Token: {Token}", tokenString);

            // Set the token in the response headers
            Response.Headers.Add("Authorization", $"Bearer {tokenString}");

            return Ok(new 
            { 
                token = tokenString,
                expiration = token.ValidTo,
                email = user.Email,
                username = user.UserName,
                roles = roles
            });
        }

        // GET: api/auth/ping (test endpoint)
        [HttpGet("ping")]
        public IActionResult Ping() => Ok("API is alive");

        // GET: api/auth/count (get total number of users)
        [HttpGet("count")]
        public async Task<IActionResult> GetUserCount()
        {
            try
            {
                var count = await _userManager.Users.CountAsync();
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user count");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/auth/recent (get recently registered users)
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentUsers([FromQuery] int count = 5)
        {
            try
            {
                // This is a simple implementation. In a real app, you'd track last login
                var users = await _userManager.Users
                    .OrderByDescending(u => u.Id)
                    .Take(count)
                    .Select(u => new { u.Id, u.UserName, u.Email })
                    .ToListAsync();
                
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching recent users");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/auth/users
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            var users = await _userManager.Users.Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.FirstName,
                u.LastName,
                u.CreatedAt,
                Roles = _userManager.GetRolesAsync(u).Result
            }).ToListAsync();
            return Ok(users);
        }

        // GET: api/auth/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);
            
            if (user == null)
                return NotFound("User not found");

            var roles = await _userManager.GetRolesAsync(user);
            
            return Ok(new 
            {
                user.Id,
                user.UserName,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedAt,
                Roles = roles
            });
        }

        // POST: api/auth/roles
        [HttpPost("roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRole([FromBody] string roleName)
        {
            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (roleExists)
                return BadRequest("Role already exists");

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
            if (result.Succeeded)
                return Ok(new { message = $"Role {roleName} created successfully" });

            return BadRequest(result.Errors);
        }

        // POST: api/auth/users/{userId}/roles
        [HttpPost("users/{userId}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddUserToRole(string userId, [FromBody] string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (!roleExists)
                return NotFound("Role not found");

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
                return Ok(new { message = $"User added to role {roleName} successfully" });

            return BadRequest(result.Errors);
        }

        // DELETE: api/auth/users/{id}
        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found.");

            try
            {
                // First, set CreatedById to null for all products created by this user to avoid foreign key constraint issues
                var products = await _context.Products.Where(p => p.CreatedById == id).ToListAsync();
                foreach (var product in products)
                {
                    product.CreatedById = null;
                }
                await _context.SaveChangesAsync();

                var result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                    return Ok(new { message = "User deleted successfully." });

                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);

                return BadRequest(ModelState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the user.", details = ex.Message });
            }
        }

        // PUT: api/auth/users/{id}
        [HttpPut("users/{id}")]
        // Removed [Authorize] completely to allow updating without authentication for debugging
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found.");

            if (!string.IsNullOrEmpty(model.Email))
                user.Email = model.Email;
            if (!string.IsNullOrEmpty(model.UserName))
                user.UserName = model.UserName;
            // Update other properties as needed

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
                return Ok(new { message = "User updated successfully." });

            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);

            return BadRequest(ModelState);
        }

        // POST: api/auth/update-existing-users-createdat
        [HttpPost("update-existing-users-createdat")]
        public async Task<IActionResult> UpdateExistingUsersCreatedAt()
        {
            var users = await _userManager.Users.ToListAsync();
            int updatedCount = 0;

            foreach (var user in users)
            {
                if (user.CreatedAt == default(DateTime) || user.CreatedAt.Year == 1)
                {
                    user.CreatedAt = DateTime.UtcNow; // Set to current time as a placeholder
                    var result = await _userManager.UpdateAsync(user);
                    if (result.Succeeded)
                        updatedCount++;
                }
            }

            return Ok(new { message = $"Updated CreatedAt for {updatedCount} users." });
        }

        // Model for updating user
        public class UpdateUserModel
        {
            public string? Email { get; set; }
            public string? UserName { get; set; }
            // Add other editable fields as needed
        }
    }
}
