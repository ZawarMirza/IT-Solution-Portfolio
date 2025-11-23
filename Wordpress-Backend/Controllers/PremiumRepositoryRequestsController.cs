using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using ProductAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Wordpress_Backend.Models;
using Wordpress_Backend.Services.Email;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PremiumRepositoryRequestsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _emailTemplateService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PremiumRepositoryRequestsController> _logger;

        public PremiumRepositoryRequestsController(
            ProductDbContext context,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender,
            EmailTemplateService emailTemplateService,
            IConfiguration configuration,
            ILogger<PremiumRepositoryRequestsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _emailSender = emailSender;
            _emailTemplateService = emailTemplateService;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/PremiumRepositoryRequests
        // Create a new request (for logged-in users)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PremiumRepositoryRequest>> CreateRequest([FromBody] CreateRequestModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Check if repository exists and is premium
                var repository = await _context.Repositories.FindAsync(model.RepositoryId);
                if (repository == null)
                {
                    return NotFound(new { message = "Repository not found" });
                }

                if (repository.Category != "Premium")
                {
                    return BadRequest(new { message = "This repository is not premium" });
                }

                // Check if user already has a pending or approved request for this repository
                // Allow new requests if previous one was rejected (unapproved)
                var existingRequest = await _context.PremiumRepositoryRequests
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.RepositoryId == model.RepositoryId && 
                        (r.Status == "pending" || r.Status == "approved"));

                if (existingRequest != null)
                {
                    if (existingRequest.Status == "approved")
                    {
                        return BadRequest(new { message = "You already have approved access to this repository" });
                    }
                    if (existingRequest.Status == "pending")
                    {
                        return BadRequest(new { message = "You already have a pending request for this repository" });
                    }
                }

                // Create new request
                var request = new PremiumRepositoryRequest
                {
                    UserId = userId,
                    RepositoryId = model.RepositoryId,
                    Message = model.Message,
                    Status = "pending",
                    RequestedAt = DateTime.UtcNow
                };

                _context.PremiumRepositoryRequests.Add(request);
                await _context.SaveChangesAsync();

                // Load related data for response
                await _context.Entry(request)
                    .Reference(r => r.Repository)
                    .LoadAsync();
                await _context.Entry(request)
                    .Reference(r => r.User)
                    .LoadAsync();

                // Send email notifications to user and admin
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                
                // Send email to user
                if (request.User != null && !string.IsNullOrEmpty(request.User.Email))
                {
                    try
                    {
                        var userEmailBody = _emailTemplateService.GeneratePremiumRequestNotificationEmail(
                            request.User.FirstName ?? "User",
                            repository.Name,
                            frontendUrl
                        );

                        await _emailSender.SendEmailAsync(
                            request.User.Email,
                            "Premium Repository Access Request Submitted - IT Solution Portfolio",
                            userEmailBody
                        );

                        _logger.LogInformation("✓ Request notification email sent to user {Email} for request {RequestId}", 
                            request.User.Email, request.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "✗ Failed to send request notification email to user {Email}. Error: {Error}", 
                            request.User.Email, ex.Message);
                        _logger.LogError(ex, "Full exception details: {Exception}", ex.ToString());
                        // Don't fail the request creation if email fails
                    }
                }

                // Send email to all admin users
                try
                {
                    var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                    _logger.LogInformation("Found {Count} admin users to notify", adminUsers.Count);
                    
                    if (adminUsers.Count == 0)
                    {
                        _logger.LogWarning("No admin users found in the system. Email notifications will not be sent to admins.");
                    }
                    
                    foreach (var admin in adminUsers)
                    {
                        _logger.LogInformation("Processing admin user: {Email}, EmailConfirmed: {EmailConfirmed}", 
                            admin.Email, admin.EmailConfirmed);
                            
                        if (!string.IsNullOrEmpty(admin.Email))
                        {
                            try
                            {
                                var adminEmailBody = _emailTemplateService.GeneratePremiumRequestAdminNotificationEmail(
                                    $"{request.User?.FirstName} {request.User?.LastName}".Trim() ?? request.User?.Email ?? "Unknown User",
                                    request.User?.Email ?? "Unknown",
                                    repository.Name,
                                    repository.Description ?? "No description available",
                                    request.Message ?? "No message provided",
                                    frontendUrl,
                                    request.Id
                                );

                                await _emailSender.SendEmailAsync(
                                    admin.Email,
                                    $"New Premium Repository Access Request - {repository.Name}",
                                    adminEmailBody
                                );

                                _logger.LogInformation("✓ Request notification email sent to admin {Email} for request {RequestId}", 
                                    admin.Email, request.Id);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "✗ Failed to send request notification email to admin {Email}. Error: {Error}", 
                                    admin.Email, ex.Message);
                                _logger.LogError(ex, "Full exception details: {Exception}", ex.ToString());
                                // Continue with other admins even if one fails
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Admin user {UserId} has no email address configured", admin.Id);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "✗ Error sending request notification emails to admins. Error: {Error}", ex.Message);
                    _logger.LogError(ex, "Full exception details: {Exception}", ex.ToString());
                    // Don't fail the request creation if admin emails fail
                }

                return Ok(new
                {
                    id = request.Id,
                    userId = request.UserId,
                    repositoryId = request.RepositoryId,
                    repositoryName = repository.Name,
                    message = request.Message,
                    status = request.Status,
                    requestedAt = request.RequestedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating premium repository request");
                return StatusCode(500, new { message = "An error occurred while creating the request" });
            }
        }

        // GET: api/PremiumRepositoryRequests
        // Get all requests (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetRequests()
        {
            try
            {
                var requests = await _context.PremiumRepositoryRequests
                    .Include(r => r.Repository)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.RequestedAt)
                    .ToListAsync();

                var result = requests.Select(r => new
                {
                    id = r.Id,
                    userId = r.UserId,
                    userName = r.User?.FirstName + " " + r.User?.LastName,
                    userEmail = r.User?.Email,
                    repositoryId = r.RepositoryId,
                    repositoryName = r.Repository?.Name,
                    repositoryDescription = r.Repository?.Description,
                    message = r.Message,
                    status = r.Status,
                    adminNotes = r.AdminNotes,
                    approvedBy = r.ApprovedBy,
                    requestedAt = r.RequestedAt,
                    reviewedAt = r.ReviewedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching premium repository requests");
                return StatusCode(500, new { message = "An error occurred while fetching requests" });
            }
        }

        // GET: api/PremiumRepositoryRequests/my-requests
        // Get current user's requests
        [HttpGet("my-requests")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMyRequests()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var requests = await _context.PremiumRepositoryRequests
                    .Include(r => r.Repository)
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.RequestedAt)
                    .ToListAsync();

                var result = requests.Select(r => new
                {
                    id = r.Id,
                    repositoryId = r.RepositoryId,
                    repositoryName = r.Repository?.Name,
                    repositoryDescription = r.Repository?.Description,
                    message = r.Message,
                    status = r.Status,
                    adminNotes = r.AdminNotes,
                    requestedAt = r.RequestedAt,
                    reviewedAt = r.ReviewedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user's premium repository requests");
                return StatusCode(500, new { message = "An error occurred while fetching requests" });
            }
        }

        // PUT: api/PremiumRepositoryRequests/{id}/approve
        // Approve a request (admin only)
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(int id, [FromBody] ApproveRequestModel model)
        {
            try
            {
                var request = await _context.PremiumRepositoryRequests
                    .Include(r => r.Repository)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                {
                    return NotFound(new { message = "Request not found" });
                }

                if (request.Status != "pending")
                {
                    return BadRequest(new { message = $"Request is already {request.Status}" });
                }

                var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Update request
                request.Status = "approved";
                request.AdminNotes = model.AdminNotes;
                request.ApprovedBy = adminUserId;
                request.ReviewedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send approval email to user
                if (request.User != null && !string.IsNullOrEmpty(request.User.Email))
                {
                    try
                    {
                        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                        var emailBody = _emailTemplateService.GeneratePremiumRequestApprovalEmail(
                            request.User.FirstName ?? "User",
                            request.Repository?.Name ?? "Premium Repository",
                            frontendUrl
                        );

                        await _emailSender.SendEmailAsync(
                            request.User.Email,
                            "Premium Repository Access Approved - IT Solution Portfolio",
                            emailBody
                        );

                        _logger.LogInformation("Approval email sent to {Email} for request {RequestId}", 
                            request.User.Email, request.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send approval email to {Email}", request.User.Email);
                        // Don't fail the approval if email fails
                    }
                }

                return Ok(new
                {
                    message = "Request approved successfully",
                    id = request.Id,
                    status = request.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving premium repository request");
                return StatusCode(500, new { message = "An error occurred while approving the request" });
            }
        }

        // PUT: api/PremiumRepositoryRequests/{id}/reject
        // Reject a request (admin only)
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectRequestModel model)
        {
            try
            {
                var request = await _context.PremiumRepositoryRequests
                    .Include(r => r.Repository)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                {
                    return NotFound(new { message = "Request not found" });
                }

                if (request.Status != "pending")
                {
                    return BadRequest(new { message = $"Request is already {request.Status}" });
                }

                var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Update request
                request.Status = "rejected";
                request.AdminNotes = model.Reason;
                request.ApprovedBy = adminUserId;
                request.ReviewedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send rejection email to user
                if (request.User != null && !string.IsNullOrEmpty(request.User.Email))
                {
                    try
                    {
                        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                        var emailBody = _emailTemplateService.GeneratePremiumRequestRejectionEmail(
                            request.User.FirstName ?? "User",
                            request.Repository?.Name ?? "Premium Repository",
                            model.Reason ?? "No reason provided"
                        );

                        await _emailSender.SendEmailAsync(
                            request.User.Email,
                            "Premium Repository Access Request Rejected - IT Solution Portfolio",
                            emailBody
                        );

                        _logger.LogInformation("Rejection email sent to {Email} for request {RequestId}", 
                            request.User.Email, request.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send rejection email to {Email}", request.User.Email);
                        // Don't fail the rejection if email fails
                    }
                }

                return Ok(new
                {
                    message = "Request rejected successfully",
                    id = request.Id,
                    status = request.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting premium repository request");
                return StatusCode(500, new { message = "An error occurred while rejecting the request" });
            }
        }

        // PUT: api/PremiumRepositoryRequests/{id}/unapprove
        // Unapprove a previously approved request (admin only)
        [HttpPut("{id}/unapprove")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnapproveRequest(int id, [FromBody] UnapproveRequestModel model)
        {
            try
            {
                var request = await _context.PremiumRepositoryRequests
                    .Include(r => r.Repository)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                {
                    return NotFound(new { message = "Request not found" });
                }

                if (request.Status != "approved")
                {
                    return BadRequest(new { message = $"Request is not approved. Current status: {request.Status}" });
                }

                var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Update request - set to rejected so user can request again
                request.Status = "rejected";
                request.AdminNotes = model.Reason ?? "Access revoked by admin";
                request.ApprovedBy = adminUserId;
                request.ReviewedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send unapproval email to user
                if (request.User != null && !string.IsNullOrEmpty(request.User.Email))
                {
                    try
                    {
                        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                        var emailBody = _emailTemplateService.GeneratePremiumRequestUnapprovalEmail(
                            request.User.FirstName ?? "User",
                            request.Repository?.Name ?? "Premium Repository",
                            model.Reason ?? "Access has been revoked by an administrator"
                        );

                        await _emailSender.SendEmailAsync(
                            request.User.Email,
                            "Premium Repository Access Revoked - IT Solution Portfolio",
                            emailBody
                        );

                        _logger.LogInformation("Unapproval email sent to {Email} for request {RequestId}", 
                            request.User.Email, request.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send unapproval email to {Email}", request.User.Email);
                        // Don't fail the unapproval if email fails
                    }
                }

                return Ok(new
                {
                    message = "Request unapproved successfully",
                    id = request.Id,
                    status = request.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unapproving premium repository request");
                return StatusCode(500, new { message = "An error occurred while unapproving the request" });
            }
        }

        // GET: api/PremiumRepositoryRequests/check-access/{repositoryId}
        // Check if current user has approved access to a premium repository
        [HttpGet("check-access/{repositoryId}")]
        [Authorize]
        public async Task<ActionResult<object>> CheckAccess(int repositoryId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Check if user is admin (admins have access to all)
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Ok(new { hasAccess = true, reason = "Admin access" });
                }

                // Check if repository is premium
                var repository = await _context.Repositories.FindAsync(repositoryId);
                if (repository == null)
                {
                    return NotFound(new { message = "Repository not found" });
                }

                if (repository.Category != "Premium")
                {
                    return Ok(new { hasAccess = true, reason = "Repository is not premium" });
                }

                // Check if user has approved request
                var approvedRequest = await _context.PremiumRepositoryRequests
                    .FirstOrDefaultAsync(r => r.UserId == userId && 
                        r.RepositoryId == repositoryId && 
                        r.Status == "approved");

                return Ok(new
                {
                    hasAccess = approvedRequest != null,
                    reason = approvedRequest != null ? "Approved request" : "No approved request found"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking premium repository access");
                return StatusCode(500, new { message = "An error occurred while checking access" });
            }
        }
    }

    public class CreateRequestModel
    {
        [Required]
        public int RepositoryId { get; set; }
        
        [StringLength(500)]
        public string? Message { get; set; }
    }

    public class ApproveRequestModel
    {
        [StringLength(1000)]
        public string? AdminNotes { get; set; }
    }

    public class RejectRequestModel
    {
        [StringLength(1000)]
        public string? Reason { get; set; }
    }

    public class UnapproveRequestModel
    {
        [StringLength(1000)]
        public string? Reason { get; set; }
    }
}

