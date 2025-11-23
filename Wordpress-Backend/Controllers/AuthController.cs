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
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Wordpress_Backend.Services.Email;
using System.Security.Cryptography;
using System.Net;

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
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _emailTemplateService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            ProductDbContext context,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _context = context;
            _emailSender = emailSender;
            _emailTemplateService = new EmailTemplateService(_configuration["FrontendUrl"] ?? "http://localhost:3000");
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [AllowAnonymous] // Allow unauthenticated access for registration
        [Route("register")] // Explicit route
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            // Log received data for debugging
            _logger.LogInformation("Registration request received. Email: {Email}, FirstName: {FirstName}, LastName: {LastName}, Role: {Role}", 
                model?.Email, model?.FirstName, model?.LastName, model?.Role);
            
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                _logger.LogWarning("ModelState validation failed: {Errors}", string.Join(", ", errors));
                return BadRequest(ModelState);
            }

            // Validate required fields manually
            if (string.IsNullOrWhiteSpace(model.FirstName))
            {
                _logger.LogWarning("FirstName is null or empty");
                return BadRequest(new { message = "First name is required" });
            }
            
            if (string.IsNullOrWhiteSpace(model.LastName))
            {
                _logger.LogWarning("LastName is null or empty");
                return BadRequest(new { message = "Last name is required" });
            }
            
            if (string.IsNullOrWhiteSpace(model.Email))
            {
                _logger.LogWarning("Email is null or empty");
                return BadRequest(new { message = "Email is required" });
            }
            
            if (string.IsNullOrWhiteSpace(model.Password))
            {
                _logger.LogWarning("Password is null or empty");
                return BadRequest(new { message = "Password is required" });
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // Set EmailConfirmed to false - user must verify email
            user.EmailConfirmed = false;

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Reload user from database to ensure we have the latest state
                user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    _logger.LogError("User was created but could not be found by email: {Email}", model.Email);
                    return StatusCode(500, new { message = "User creation succeeded but user could not be found." });
                }
                
                // Double-check EmailConfirmed is false
                if (user.EmailConfirmed)
                {
                    _logger.LogWarning("User {Email} was created with EmailConfirmed=true, setting to false", user.Email);
                    user.EmailConfirmed = false;
                    await _userManager.UpdateAsync(user);
                }
                
                _logger.LogInformation("User created: {Email}, EmailConfirmed: {Confirmed}, Id: {Id}", 
                    user.Email, user.EmailConfirmed, user.Id);
                
                // Assign role based on registration request or default to User
                string roleToAssign = "User"; // Default role
                if (!string.IsNullOrEmpty(model.Role))
                {
                    if (model.Role == "Admin")
                        roleToAssign = "Admin";
                    else if (model.Role == "Guest")
                        roleToAssign = "Guest";
                }
                await _userManager.AddToRoleAsync(user, roleToAssign);
                
                // Generate email confirmation token
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                
                // Hash and store the token in the database
                var tokenHash = HashToken(emailToken);
                user.VerificationTokenHash = tokenHash;
                user.VerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24); // 24 hours expiry
                await _userManager.UpdateAsync(user);
                
                _logger.LogInformation("Token hash stored for user {Email}: {Hash} (first 20 chars)", 
                    user.Email, tokenHash.Substring(0, Math.Min(20, tokenHash.Length)));
                
                // Encode token for URL - use query parameter instead of path parameter
                // This avoids issues with special characters in the token
                var encodedToken = WebUtility.UrlEncode(emailToken);
                var verificationLink = $"{_emailTemplateService.BaseUrl}/verify-email?token={encodedToken}";
                
                // Send verification email
                try
                {
                    var emailBody = _emailTemplateService.GenerateVerificationEmail(user.FirstName ?? "User", verificationLink);
                    await _emailSender.SendEmailAsync(
                        user.Email ?? string.Empty,
                        "Verify Your Email Address - IT Solution Portfolio",
                        emailBody
                    );
                    _logger.LogInformation("Verification email sent to {Email}", user.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
                    // Don't fail registration if email fails, but log it
                }
                
                return Ok(new 
                { 
                    message = "Registration successful! Please check your email to verify your account before logging in.",
                    requiresVerification = true,
                    email = user.Email
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

            // Check if email is verified (except for Admin users)
            if (!user.EmailConfirmed && !await _userManager.IsInRoleAsync(user, "Admin"))
            {
                return Unauthorized(new { 
                    message = "Please verify your email address before logging in. Check your inbox for the verification link.",
                    requiresVerification = true,
                    email = user.Email
                });
            }

            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            
            // Log roles for debugging
            _logger.LogInformation("User {Email} has roles: {Roles}", user.Email, string.Join(", ", roles));
            Console.WriteLine($"[Login] User {user.Email} has roles: {string.Join(", ", roles)}");
            
            var roleClaims = new List<Claim>();
            var permissionClaims = new List<Claim>();

            foreach (var role in roles)
            {
                roleClaims.Add(new Claim(ClaimTypes.Role, role));
                _logger.LogInformation("Added role claim: {Role}", role);
                Console.WriteLine($"[Login] Added role claim: {role}");
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

            // Log all claims for debugging
            var allClaimTypes = claims.Select(c => c.Type).ToList();
            _logger.LogInformation("JWT Token will contain claim types: {ClaimTypes}", string.Join(", ", allClaimTypes));
            Console.WriteLine($"[Login] JWT Token will contain claim types: {string.Join(", ", allClaimTypes)}");
            var roleClaimValues = claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            _logger.LogInformation("Role claims in token: {RoleClaims}", string.Join(", ", roleClaimValues));
            Console.WriteLine($"[Login] Role claims in token: {string.Join(", ", roleClaimValues)}");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "ThisIsASecretKeyForJwtTokenGeneration1234567890"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:ValidIssuer"],
                audience: _configuration["Jwt:ValidAudience"],
                expires: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpireInMinutes", 60)),
                claims: claims,
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Generate and store refresh token
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 days expiry for refresh token
            var updateResult = await _userManager.UpdateAsync(user);
            
            if (!updateResult.Succeeded)
            {
                _logger.LogError("Failed to update refresh token for user {UserId}", user.Id);
                // Continue anyway - the login should still succeed
            }

            _logger.LogInformation("JWT Token generated for user {UserId}", user.Id);
            _logger.LogDebug("JWT Token: {Token}", tokenString);

            // Set the token in the response headers
            Response.Headers.Add("Authorization", $"Bearer {tokenString}");

            return Ok(new 
            { 
                token = tokenString,
                refreshToken = refreshToken,
                user = new 
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    role = roles.FirstOrDefault() ?? "User"
                },
                expiration = token.ValidTo
            });
        }

        // POST: api/auth/refresh-token
        [HttpPost("refresh-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel model)
        {
            if (string.IsNullOrEmpty(model.Token))
                return Unauthorized(new { message = "Invalid token" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == model.Token);
            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return Unauthorized(new { message = "Invalid token or token expired" });

            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            var refreshToken = GenerateRefreshToken();

            // Update refresh token in database
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 days expiry for refresh token
            var updateResult = await _userManager.UpdateAsync(user);
            
            if (!updateResult.Succeeded)
            {
                _logger.LogError("Failed to update refresh token for user {UserId}", user.Id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to update refresh token" });
            }

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                refreshToken,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.UserName,
                    roles = roles.ToList()
                },
                message = "Token refreshed successfully"
            });
        }

        // PUT: api/auth/update-profile
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPut("update-profile")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // Update user properties
            user.FirstName = model.FirstName ?? user.FirstName;
            user.LastName = model.LastName ?? user.LastName;
            user.Email = model.Email ?? user.Email;
            user.UserName = model.Email ?? user.Email;
            user.UpdatedAt = DateTime.UtcNow;

            // If email is being changed, mark email as unconfirmed
            if (!string.IsNullOrEmpty(model.Email) && model.Email != user.Email)
            {
                user.EmailConfirmed = false;
                // In a real app, send email confirmation here
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Get updated user data with roles
            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.UserName,
                    roles = roles.ToList()
                },
                message = "Profile updated successfully"
            });
        }

        // PUT: api/auth/change-password
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPut("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // Change password
            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { message = "Failed to change password", errors });
            }

            // Update user's security stamp to invalidate existing tokens
            await _userManager.UpdateSecurityStampAsync(user);
            
            // Generate new token with updated security stamp
            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                message = "Password changed successfully"
            });
        }

        // GET: api/auth/ping (test endpoint)
        [HttpGet("ping")]
        public IActionResult Ping() => Ok("API is alive");

        // Helper method to generate JWT token
        private JwtSecurityToken GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id)
            };

            // Add roles to claims
            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
                _logger.LogInformation("Added role claim to token: {Role} for user {Email}", role, user.Email);
            }

            // Use the same configuration keys as the Login method (Jwt, not JWT)
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? "ThisIsAStrongAndSecureSecretKeyForJWTTokens-ChangeMeInProduction"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:ValidIssuer"] ?? "WordpressBackend",
                audience: _configuration["Jwt:ValidAudience"] ?? "WordpressFrontend",
                expires: DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpireInMinutes", 1440)),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            // Log role claims for debugging
            var roleClaimValues = authClaims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            _logger.LogInformation("Generated JWT token for user {Email} with roles: {Roles}", user.Email, string.Join(", ", roleClaimValues));

            return token;
        }

        // Helper method to generate refresh token
        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

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

        // POST: api/auth/verify-email
        [HttpPost("verify-email")]
        [AllowAnonymous] // Allow unauthenticated access for email verification
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Token))
            {
                _logger.LogWarning("Verify email called with null model or empty token. ModelState.IsValid: {IsValid}", ModelState.IsValid);
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("ModelState errors: {Errors}", string.Join(", ", errors));
                }
                return BadRequest(new { 
                    message = "Invalid verification token. Token is missing or empty.",
                    errorType = "invalid_token",
                    details = ModelState.IsValid ? "Token is null or empty" : "Model validation failed"
                });
            }
            
            _logger.LogInformation("Received verification request. Token length: {Length}, Token starts with: {Start}", 
                model.Token?.Length ?? 0, 
                model.Token?.Length > 0 ? model.Token.Substring(0, Math.Min(50, model.Token.Length)) : "empty");

            // Handle token - React Router's useSearchParams() auto-decodes query parameters
            // So the token is likely already decoded when it reaches us
            // ASP.NET Identity tokens contain +, /, = characters that need to be preserved
            var decodedToken = model.Token;
            
            // Try multiple token variations to handle encoding issues
            var tokensToTry = new List<string> { model.Token };
            
            // If token contains % signs, it might still be encoded (shouldn't happen with query params, but just in case)
            if (model.Token.Contains("%"))
            {
                try
                {
                    var onceDecoded = WebUtility.UrlDecode(model.Token);
                    if (onceDecoded != model.Token)
                    {
                        tokensToTry.Add(onceDecoded);
                    }
                    
                    // Check for double encoding
                    if (onceDecoded.Contains("%"))
                    {
                        var twiceDecoded = WebUtility.UrlDecode(onceDecoded);
                        if (twiceDecoded != onceDecoded)
                        {
                            tokensToTry.Add(twiceDecoded);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error during token decoding attempt");
                }
            }
            
            // Also try URL encoding the token in case it needs to be re-encoded
            // (Sometimes + gets converted to space, etc.)
            try
            {
                var reEncoded = WebUtility.UrlEncode(model.Token);
                if (reEncoded != model.Token && !tokensToTry.Contains(reEncoded))
                {
                    tokensToTry.Add(reEncoded);
                    // And decode it back
                    var reDecoded = WebUtility.UrlDecode(reEncoded);
                    if (reDecoded != model.Token && !tokensToTry.Contains(reDecoded))
                    {
                        tokensToTry.Add(reDecoded);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during token re-encoding attempt");
            }
            
            _logger.LogInformation("Attempting to verify email with token (original length: {Length}, will try {Count} variations)", 
                model.Token?.Length ?? 0, tokensToTry.Count);
            _logger.LogInformation("Token sample (first 50 chars): {Sample}", 
                model.Token?.Length > 50 ? model.Token.Substring(0, 50) : model.Token);
            
            // First, try to find the user by matching the token hash
            // This is more efficient than trying all users
            ApplicationUser? verifiedUser = null;
            ApplicationUser? expiredUser = null;
            IdentityResult? confirmResult = null;
            
            // Log all users for debugging
            var allUsersDebug = await _userManager.Users.ToListAsync();
            _logger.LogInformation("Total users in database: {Count}", allUsersDebug.Count);
            foreach (var u in allUsersDebug)
            {
                _logger.LogInformation("User: {Email}, EmailConfirmed: {Confirmed}, HasTokenHash: {HasHash}", 
                    u.Email, u.EmailConfirmed, !string.IsNullOrEmpty(u.VerificationTokenHash));
            }
            
            // Try to find user by token hash first
            foreach (var tokenToTry in tokensToTry)
            {
                var tokenHash = HashToken(tokenToTry);
                _logger.LogInformation("Looking for user with token hash: {Hash} (first 20 chars)", 
                    tokenHash.Substring(0, Math.Min(20, tokenHash.Length)));
                
                // First try to find by hash (including already verified users)
                var userByHash = await _userManager.Users
                    .Where(u => u.VerificationTokenHash == tokenHash)
                    .FirstOrDefaultAsync();
                
                if (userByHash != null)
                {
                    _logger.LogInformation("Found user {Email} by token hash, EmailConfirmed: {Confirmed}", 
                        userByHash.Email, userByHash.EmailConfirmed);
                    
                    // Check if user is already verified
                    if (userByHash.EmailConfirmed)
                    {
                        _logger.LogInformation("User {Email} is already verified. Returning success.", userByHash.Email);
                        verifiedUser = userByHash;
                        decodedToken = tokenToTry;
                        // Clear the token hash since it's been used
                        userByHash.VerificationTokenHash = null;
                        userByHash.VerificationTokenExpiresAt = null;
                        await _userManager.UpdateAsync(userByHash);
                        break;
                    }
                    
                    // Check if token is expired
                    if (userByHash.VerificationTokenExpiresAt.HasValue && 
                        userByHash.VerificationTokenExpiresAt.Value <= DateTime.UtcNow)
                    {
                        expiredUser = userByHash;
                        _logger.LogWarning("Token expired for user {Email}", userByHash.Email);
                        continue;
                    }
                    
                    // Try to confirm email with this token
                    _logger.LogInformation("Attempting to verify user {Email} with token (length: {Length})", 
                        userByHash.Email, tokenToTry?.Length ?? 0);
                    
                    // Log token sample for debugging
                    _logger.LogInformation("Token sample (first 50): {Sample}, (last 50): {LastSample}", 
                        tokenToTry?.Length > 50 ? tokenToTry.Substring(0, 50) : tokenToTry,
                        tokenToTry?.Length > 50 ? tokenToTry.Substring(tokenToTry.Length - 50) : "");
                    
                    // Log stored vs computed hash
                    _logger.LogInformation("Stored token hash: {StoredHash} (first 20), Computed hash: {ComputedHash} (first 20)", 
                        !string.IsNullOrEmpty(userByHash.VerificationTokenHash) 
                            ? userByHash.VerificationTokenHash.Substring(0, Math.Min(20, userByHash.VerificationTokenHash.Length)) 
                            : "null",
                        tokenHash.Substring(0, Math.Min(20, tokenHash.Length)));
                    
                    // Log user security stamp (ASP.NET Identity uses this for token validation)
                    _logger.LogInformation("User SecurityStamp: {SecurityStamp}", userByHash.SecurityStamp);
                    
                    confirmResult = await _userManager.ConfirmEmailAsync(userByHash, tokenToTry);
                    if (confirmResult.Succeeded)
                    {
                        verifiedUser = userByHash;
                        decodedToken = tokenToTry;
                        _logger.LogInformation("✓ Successfully verified email for user {Email}", userByHash.Email);
                        break;
                    }
                    else
                    {
                        var errorMessages = string.Join(", ", confirmResult.Errors.Select(e => e.Description));
                        _logger.LogWarning("Token validation failed for user {Email}: {Errors}", 
                            userByHash.Email, errorMessages);
                        
                        // If the error is about invalid token, try regenerating the token to see if it matches
                        if (errorMessages.Contains("Invalid token") || errorMessages.Contains("token"))
                        {
                            _logger.LogWarning("Token validation failed. This might be due to security stamp change or token corruption.");
                            _logger.LogWarning("User ID: {UserId}, SecurityStamp: {SecurityStamp}", userByHash.Id, userByHash.SecurityStamp);
                        }
                    }
                }
                else
                {
                    _logger.LogDebug("No user found with token hash: {Hash} (first 20 chars)", 
                        tokenHash.Substring(0, Math.Min(20, tokenHash.Length)));
                }
            }
            
            // If hash matching didn't work, fall back to trying all users (for backwards compatibility)
            if (verifiedUser == null)
            {
                _logger.LogInformation("Token hash matching failed, trying all unverified users");
                
                var users = await _userManager.Users
                    .Where(u => !u.EmailConfirmed)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} unverified users", users.Count);
                
                // Log user emails for debugging
                if (users.Any())
                {
                    _logger.LogInformation("Unverified user emails: {Emails}", string.Join(", ", users.Select(u => u.Email)));
                }
                
                // Try each token variation with each user
                foreach (var tokenToTry in tokensToTry)
                {
                    foreach (var user in users)
                    {
                        try
                        {
                            // Check if token is expired first
                            if (user.VerificationTokenExpiresAt.HasValue && 
                                user.VerificationTokenExpiresAt.Value <= DateTime.UtcNow)
                            {
                                if (expiredUser == null)
                                    expiredUser = user;
                                _logger.LogInformation("User {Email} has expired token", user.Email);
                                continue;
                            }

                            // Try to confirm email with this token variation
                            _logger.LogDebug("Trying token variation (length: {Length}) for user {Email}", 
                                tokenToTry?.Length ?? 0, user.Email);
                            
                            confirmResult = await _userManager.ConfirmEmailAsync(user, tokenToTry);
                            if (confirmResult.Succeeded)
                            {
                                verifiedUser = user;
                                decodedToken = tokenToTry;
                                _logger.LogInformation("✓ Successfully verified email for user {Email} with token variation (length: {Length})", 
                                    user.Email, tokenToTry?.Length ?? 0);
                                break;
                            }
                            else
                            {
                                var errorMessages = string.Join(", ", confirmResult.Errors.Select(e => e.Description));
                                _logger.LogDebug("Token validation failed for user {Email} with token variation (length: {Length}): {Errors}", 
                                    user.Email, tokenToTry?.Length ?? 0, errorMessages);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Error verifying token for user {Email}", user.Email);
                            // Continue to next user/token combination
                        }
                    }
                    
                    // If we found a verified user, break out of token loop
                    if (verifiedUser != null)
                        break;
                }
            }

            // If no user found, check if token expired or user already verified
            if (verifiedUser == null)
            {
                // Check if any user has an expired token
                if (expiredUser != null)
                {
                    _logger.LogWarning("Verification failed: Token expired for user {Email}", expiredUser.Email);
                    return BadRequest(new { 
                        message = "Verification token has expired. Please request a new verification email.",
                        errorType = "token_expired",
                        email = expiredUser.Email
                    });
                }
                
                // Log detailed information for debugging
                var allUsers = await _userManager.Users.ToListAsync();
                var unverifiedCount = allUsers.Count(u => !u.EmailConfirmed);
                var verifiedCount = allUsers.Count(u => u.EmailConfirmed);
                
                // Check if any users have token hashes stored and are already verified
                var usersWithHashes = allUsers.Where(u => !string.IsNullOrEmpty(u.VerificationTokenHash)).ToList();
                
                // Try to hash the received token and see if it matches any stored hash
                foreach (var tokenToTry in tokensToTry)
                {
                    var receivedHash = HashToken(tokenToTry);
                    var matchingUser = usersWithHashes.FirstOrDefault(u => u.VerificationTokenHash == receivedHash);
                    if (matchingUser != null)
                    {
                        // If user is already verified, return success instead of error
                        if (matchingUser.EmailConfirmed)
                        {
                            _logger.LogInformation("User {Email} is already verified. Token hash matches. Returning success.", 
                                matchingUser.Email);
                            
                            // Clear the token hash since it's been used
                            matchingUser.VerificationTokenHash = null;
                            matchingUser.VerificationTokenExpiresAt = null;
                            await _userManager.UpdateAsync(matchingUser);
                            
                            return Ok(new { 
                                message = "Email is already verified. You can now log in.",
                                success = true,
                                email = matchingUser.Email,
                                alreadyVerified = true
                            });
                        }
                        else
                        {
                            _logger.LogWarning("Found matching hash for user {Email}, but verification failed. User verified: {Verified}", 
                                matchingUser.Email, matchingUser.EmailConfirmed);
                        }
                    }
                }
                
                _logger.LogWarning("Verification failed: Invalid token or token already used");
                _logger.LogWarning("Database state: {Unverified} unverified users, {Verified} verified users", 
                    unverifiedCount, verifiedCount);
                _logger.LogWarning("Users with stored token hashes: {Count}", usersWithHashes.Count);
                
                if (usersWithHashes.Any())
                {
                    _logger.LogWarning("Users with hashes: {Emails}", 
                        string.Join(", ", usersWithHashes.Select(u => $"{u.Email} (Verified: {u.EmailConfirmed})")));
                }
                
                return BadRequest(new { 
                    message = "Invalid verification token. The link may be incorrect or already used.",
                    errorType = "invalid_token",
                    details = $"Checked {tokensToTry.Count} token variations against {unverifiedCount} unverified users"
                });
            }

            // Clear verification token (only if verification succeeded)
            if (verifiedUser != null)
            {
                // If we found the user, clear the token hash and update
                verifiedUser.VerificationTokenHash = null;
                verifiedUser.VerificationTokenExpiresAt = null;
                verifiedUser.EmailVerifiedAt = DateTime.UtcNow;
                
                // Make sure EmailConfirmed is true
                if (!verifiedUser.EmailConfirmed)
                {
                    verifiedUser.EmailConfirmed = true;
                }
                
                await _userManager.UpdateAsync(verifiedUser);
                
                _logger.LogInformation("Email verified successfully for user {Email}", verifiedUser.Email);
                
                return Ok(new { 
                    message = "Email verified successfully! You can now log in.",
                    success = true,
                    email = verifiedUser.Email
                });
            }

            return BadRequest(new { 
                message = "Email verification failed",
                errorType = "verification_failed",
                errors = confirmResult?.Errors?.Select(e => e.Description).ToArray() ?? new string[] { "Unknown error" }
            });
        }

        // GET: api/auth/verify-email/{token} - Alternative endpoint for GET requests
        [HttpGet("verify-email/{token}")]
        public async Task<IActionResult> VerifyEmailGet(string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Invalid verification token" });

            // Decode the token from URL
            var decodedToken = WebUtility.UrlDecode(token);
            
            // Try to find and verify user
            var users = await _userManager.Users
                .Where(u => !u.EmailConfirmed)
                .ToListAsync();

            foreach (var user in users)
            {
                try
                {
                    var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                    if (result.Succeeded)
                    {
                        // Clear verification token
                        user.VerificationTokenHash = null;
                        user.VerificationTokenExpiresAt = null;
                        await _userManager.UpdateAsync(user);
                        
                        // Redirect to frontend success page
                        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                        return Redirect($"{frontendUrl}/verify-email/success");
                    }
                }
                catch
                {
                    // Continue to next user
                }
            }

            // Redirect to frontend error page
            var errorUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            return Redirect($"{errorUrl}/verify-email/error");
        }

        // POST: api/auth/resend-verification
        [HttpPost("resend-verification")]
        [AllowAnonymous] // Allow unauthenticated access for resending verification
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that user doesn't exist
                return Ok(new { message = "If an account exists with this email, a verification link has been sent." });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { message = "Email is already verified" });
            }

            // Generate new verification token
            var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            
            // Hash and store the new token
            var tokenHash = HashToken(emailToken);
            user.VerificationTokenHash = tokenHash;
            user.VerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await _userManager.UpdateAsync(user);
            
                // Encode token for URL - use query parameter instead of path parameter
                // This avoids issues with special characters in the token
                var encodedToken = WebUtility.UrlEncode(emailToken);
                var verificationLink = $"{_emailTemplateService.BaseUrl}/verify-email?token={encodedToken}";
            
            // Send verification email
            try
            {
                var emailBody = _emailTemplateService.GenerateResendVerificationEmail(user.FirstName ?? "User", verificationLink);
                await _emailSender.SendEmailAsync(
                    user.Email ?? string.Empty,
                    "Verify Your Email Address - IT Solution Portfolio",
                    emailBody
                );
                _logger.LogInformation("Verification email resent to {Email}", user.Email);
                
                return Ok(new { message = "Verification email has been sent. Please check your inbox." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
                return StatusCode(500, new { message = "Failed to send verification email. Please try again later." });
            }
        }

        // Helper method to hash token
        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashBytes);
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        [AllowAnonymous] // Allow unauthenticated access for password reset
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                _logger.LogInformation("Password reset requested for non-existent email: {Email}", model.Email);
                return Ok(new { message = "If an account exists with this email, you will receive a password reset link." });
            }

            // Generate password reset token
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // Encode token for URL - use query parameter
            var encodedToken = WebUtility.UrlEncode(resetToken);
            var resetLink = $"{_emailTemplateService.BaseUrl}/reset-password?token={encodedToken}";
            
            // Send password reset email
            try
            {
                _logger.LogInformation("Attempting to send password reset email to {Email}", user.Email);
                _logger.LogInformation("Reset link: {Link}", resetLink);
                
                var emailBody = _emailTemplateService.GeneratePasswordResetEmail(user.FirstName ?? "User", resetLink);
                await _emailSender.SendEmailAsync(
                    user.Email ?? string.Empty,
                    "Reset Your Password - IT Solution Portfolio",
                    emailBody
                );
                _logger.LogInformation("✓ Password reset email sent successfully to {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "✗ Failed to send password reset email to {Email}. Error: {Error}", 
                    user.Email, ex.Message);
                _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
                // Don't fail the request if email fails, but log it
                // In production, you might want to queue the email for retry
            }
            
            return Ok(new { message = "If an account exists with this email, you will receive a password reset link." });
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        [AllowAnonymous] // Allow unauthenticated access for password reset
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                _logger.LogWarning("Reset password validation failed: {Errors}", string.Join(", ", errors));
                return BadRequest(new { 
                    message = "Invalid reset request. Please check your input.",
                    errors = errors.ToArray()
                });
            }

            if (string.IsNullOrWhiteSpace(model.Token))
            {
                _logger.LogWarning("Reset password called with empty token");
                return BadRequest(new { message = "Reset token is required." });
            }

            // Build list of token variations to try (same approach as email verification)
            var tokensToTry = new List<string> { model.Token };
            var decodedToken = model.Token;
            
            // Try decoding once
            try
            {
                var onceDecoded = WebUtility.UrlDecode(model.Token);
                if (onceDecoded != model.Token && !tokensToTry.Contains(onceDecoded))
                {
                    tokensToTry.Add(onceDecoded);
                    decodedToken = onceDecoded;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during token decoding attempt");
            }
            
            // Try decoding twice (for double-encoded tokens)
            try
            {
                var twiceDecoded = WebUtility.UrlDecode(decodedToken);
                if (twiceDecoded != decodedToken && !tokensToTry.Contains(twiceDecoded))
                {
                    tokensToTry.Add(twiceDecoded);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during second token decoding attempt");
            }
            
            // Also try URL encoding the token in case it needs to be re-encoded
            try
            {
                var reEncoded = WebUtility.UrlEncode(model.Token);
                if (reEncoded != model.Token && !tokensToTry.Contains(reEncoded))
                {
                    tokensToTry.Add(reEncoded);
                    // And decode it back
                    var reDecoded = WebUtility.UrlDecode(reEncoded);
                    if (reDecoded != model.Token && !tokensToTry.Contains(reDecoded))
                    {
                        tokensToTry.Add(reDecoded);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during token re-encoding attempt");
            }
            
            _logger.LogInformation("Password reset request for email: {Email}, Token length: {Length}, will try {Count} variations", 
                model.Email, model.Token?.Length ?? 0, tokensToTry.Count);
            _logger.LogInformation("Token sample (first 50 chars): {Sample}", 
                model.Token?.Length > 50 ? model.Token.Substring(0, 50) : model.Token);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Password reset attempted for non-existent user: {Email}", model.Email);
                return BadRequest(new { message = "Invalid reset request. User not found." });
            }

            // Try each token variation until one works
            IdentityResult? resetResult = null;
            string? successfulToken = null;
            
            foreach (var tokenToTry in tokensToTry)
            {
                _logger.LogInformation("Attempting password reset with token variation (length: {Length})", 
                    tokenToTry?.Length ?? 0);
                
                // Log token sample for debugging
                _logger.LogInformation("Token sample (first 50): {Sample}, (last 50): {LastSample}", 
                    tokenToTry?.Length > 50 ? tokenToTry.Substring(0, 50) : tokenToTry,
                    tokenToTry?.Length > 50 ? tokenToTry.Substring(tokenToTry.Length - 50) : "");
                
                // Log user security stamp (ASP.NET Identity uses this for token validation)
                _logger.LogInformation("User SecurityStamp: {SecurityStamp}", user.SecurityStamp);
                
                resetResult = await _userManager.ResetPasswordAsync(user, tokenToTry, model.NewPassword);
                if (resetResult.Succeeded)
                {
                    successfulToken = tokenToTry;
                    _logger.LogInformation("✓ Password reset successful for user {Email} with token variation", user.Email);
                    break;
                }
                else
                {
                    var errorMessages = string.Join(", ", resetResult.Errors.Select(e => e.Description));
                    _logger.LogWarning("Token variation failed for user {Email}: {Errors}", 
                        user.Email, errorMessages);
                }
            }
            
            if (resetResult != null && resetResult.Succeeded)
            {
                _logger.LogInformation("Password reset successful for user {Email}", user.Email);
                
                // Update security stamp to invalidate existing tokens
                await _userManager.UpdateSecurityStampAsync(user);
                
                return Ok(new { 
                    message = "Password reset successfully! You can now log in with your new password.",
                    success = true
                });
            }

            var finalErrorMessages = resetResult?.Errors.Select(e => e.Description).ToArray() ?? new[] { "Invalid token" };
            _logger.LogWarning("Password reset failed for user {Email} after trying {Count} token variations. Errors: {Errors}", 
                user.Email, tokensToTry.Count, string.Join(", ", finalErrorMessages));
            
            return BadRequest(new { 
                message = "Password reset failed. The link may have expired or is invalid.",
                errorType = "reset_failed",
                errors = finalErrorMessages
            });
        }

        // POST: api/auth/populate-admin
        // This endpoint manually creates the super admin user
        // Useful if the backend wasn't started or initialization failed
        [HttpPost("populate-admin")]
        public async Task<IActionResult> PopulateAdmin()
        {
            try
            {
                // Ensure Admin role exists
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("Admin"));
                }

                // Create super admin user if it doesn't exist
                string adminEmail = "admin@example.com";
                string adminPassword = "Admin@123";

                var adminUser = await _userManager.FindByEmailAsync(adminEmail);
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

                    var result = await _userManager.CreateAsync(adminUser, adminPassword);
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                        _logger.LogInformation("Super admin user created successfully: {Email}", adminEmail);
                        
                        return Ok(new 
                        { 
                            message = "Super admin created successfully",
                            credentials = new
                            {
                                email = adminEmail,
                                password = adminPassword,
                                role = "Admin"
                            },
                            note = "IMPORTANT: Change this password in production!"
                        });
                    }
                    else
                    {
                        var errors = result.Errors.Select(e => e.Description).ToArray();
                        return BadRequest(new { message = "Failed to create admin user", errors });
                    }
                }
                else
                {
                    // Check if user is in Admin role
                    var isAdmin = await _userManager.IsInRoleAsync(adminUser, "Admin");
                    if (!isAdmin)
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                    }

                    return Ok(new 
                    { 
                        message = "Super admin already exists",
                        credentials = new
                        {
                            email = adminEmail,
                            password = "*** (already set)",
                            role = "Admin"
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating super admin");
                return StatusCode(500, new { message = "An error occurred while creating super admin", error = ex.Message });
            }
        }

        // Model for updating user
        public class UpdateUserModel
        {
            public string? Email { get; set; }
            public string? UserName { get; set; }
            // Add other editable fields as needed
        }

        // Models for email verification and password reset
        public class VerifyEmailModel
        {
            [Required]
            public string Token { get; set; } = string.Empty;
        }

        public class ResendVerificationModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;
        }

        public class ForgotPasswordModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;
        }

        public class ResetPasswordModel
        {
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; } = string.Empty;
            
            [Required(ErrorMessage = "Reset token is required")]
            public string Token { get; set; } = string.Empty;
            
            [Required(ErrorMessage = "New password is required")]
            [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}
