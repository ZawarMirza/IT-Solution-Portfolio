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
    public class ReviewsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _emailTemplateService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(
            ProductDbContext context,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender,
            EmailTemplateService emailTemplateService,
            IConfiguration configuration,
            ILogger<ReviewsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _emailSender = emailSender;
            _emailTemplateService = emailTemplateService;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/Reviews
        // Create a new review (logged-in users only)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Check if repository exists
                var repository = await _context.Repositories.FindAsync(model.RepositoryId);
                if (repository == null)
                {
                    return NotFound(new { message = "Repository not found" });
                }

                // Check if user already reviewed this repository
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.RepositoryId == model.RepositoryId);

                if (existingReview != null)
                {
                    return BadRequest(new { message = "You have already reviewed this repository. You can update your existing review." });
                }

                // Get user info
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Create new review
                var review = new Review
                {
                    UserId = userId,
                    RepositoryId = model.RepositoryId,
                    Rating = model.Rating,
                    Comment = model.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Load related data
                await _context.Entry(review)
                    .Reference(r => r.Repository)
                    .LoadAsync();
                await _context.Entry(review)
                    .Reference(r => r.User)
                    .LoadAsync();

                // Update repository average rating
                await UpdateRepositoryRating(model.RepositoryId);

                // Send email notifications
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                
                // Send email to user
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    try
                    {
                        var userEmailBody = _emailTemplateService.GenerateReviewSubmittedEmail(
                            user.FirstName ?? "User",
                            repository.Name,
                            model.Rating,
                            frontendUrl
                        );

                        await _emailSender.SendEmailAsync(
                            user.Email,
                            "Review Submitted Successfully - IT Solution Portfolio",
                            userEmailBody
                        );

                        _logger.LogInformation("Review submission email sent to user {Email} for review {ReviewId}", 
                            user.Email, review.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send review submission email to user {Email}", user.Email);
                    }
                }

                // Send email to all admin users
                try
                {
                    var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                    _logger.LogInformation("Found {Count} admin users to notify about review", adminUsers.Count);
                    
                    foreach (var admin in adminUsers)
                    {
                        if (!string.IsNullOrEmpty(admin.Email))
                        {
                            try
                            {
                                var adminEmailBody = _emailTemplateService.GenerateReviewAdminNotificationEmail(
                                    $"{user.FirstName} {user.LastName}".Trim() ?? user.Email ?? "Unknown User",
                                    user.Email ?? "Unknown",
                                    repository.Name,
                                    model.Rating,
                                    model.Comment ?? "No comment provided",
                                    frontendUrl,
                                    review.Id
                                );

                                await _emailSender.SendEmailAsync(
                                    admin.Email,
                                    $"New Review Submitted - {repository.Name}",
                                    adminEmailBody
                                );

                                _logger.LogInformation("Review notification email sent to admin {Email} for review {ReviewId}", 
                                    admin.Email, review.Id);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to send review notification email to admin {Email}", admin.Email);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending review notification emails to admins");
                }

                return Ok(new
                {
                    id = review.Id,
                    userId = review.UserId,
                    repositoryId = review.RepositoryId,
                    rating = review.Rating,
                    comment = review.Comment,
                    createdAt = review.CreatedAt,
                    userName = $"{user.FirstName} {user.LastName}".Trim() ?? user.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { message = "An error occurred while creating the review" });
            }
        }

        // PUT: api/Reviews/{id}
        // Update an existing review (only by the review author)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found" });
                }

                // Check if user owns this review
                if (review.UserId != userId)
                {
                    return Forbid("You can only update your own reviews");
                }

                // Update review
                review.Rating = model.Rating;
                review.Comment = model.Comment;
                review.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Update repository average rating
                await UpdateRepositoryRating(review.RepositoryId);

                return Ok(new
                {
                    message = "Review updated successfully",
                    id = review.Id,
                    rating = review.Rating,
                    comment = review.Comment,
                    updatedAt = review.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review");
                return StatusCode(500, new { message = "An error occurred while updating the review" });
            }
        }

        // GET: api/Reviews/repository/{repositoryId}
        // Get all reviews for a specific repository
        [HttpGet("repository/{repositoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRepositoryReviews(int repositoryId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.User)
                    .Where(r => r.RepositoryId == repositoryId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                var result = reviews.Select(r => new
                {
                    id = r.Id,
                    userId = r.UserId,
                    userName = $"{r.User?.FirstName} {r.User?.LastName}".Trim() ?? r.User?.Email ?? "Anonymous",
                    userEmail = r.User?.Email,
                    repositoryId = r.RepositoryId,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    updatedAt = r.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching repository reviews");
                return StatusCode(500, new { message = "An error occurred while fetching reviews" });
            }
        }

        // GET: api/Reviews
        // Get all reviews (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllReviews()
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.User)
                    .Include(r => r.Repository)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                var result = reviews.Select(r => new
                {
                    id = r.Id,
                    userId = r.UserId,
                    userName = $"{r.User?.FirstName} {r.User?.LastName}".Trim() ?? r.User?.Email ?? "Anonymous",
                    userEmail = r.User?.Email,
                    repositoryId = r.RepositoryId,
                    repositoryName = r.Repository?.Name,
                    repositoryDescription = r.Repository?.Description,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    updatedAt = r.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all reviews");
                return StatusCode(500, new { message = "An error occurred while fetching reviews" });
            }
        }

        // DELETE: api/Reviews/{id}
        // Delete a review (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.Repository)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (review == null)
                {
                    return NotFound(new { message = "Review not found" });
                }

                var repositoryId = review.RepositoryId;

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                // Update repository average rating
                await UpdateRepositoryRating(repositoryId);

                return Ok(new { message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review");
                return StatusCode(500, new { message = "An error occurred while deleting the review" });
            }
        }

        // GET: api/Reviews/my-reviews
        // Get current user's reviews
        [HttpGet("my-reviews")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMyReviews()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var reviews = await _context.Reviews
                    .Include(r => r.Repository)
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                var result = reviews.Select(r => new
                {
                    id = r.Id,
                    repositoryId = r.RepositoryId,
                    repositoryName = r.Repository?.Name,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    updatedAt = r.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user's reviews");
                return StatusCode(500, new { message = "An error occurred while fetching reviews" });
            }
        }

        // Helper method to update repository average rating
        private async Task UpdateRepositoryRating(int repositoryId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.RepositoryId == repositoryId)
                    .ToListAsync();

                if (reviews.Any())
                {
                    var averageRating = reviews.Average(r => r.Rating);
                    var repository = await _context.Repositories.FindAsync(repositoryId);
                    if (repository != null)
                    {
                        // Note: Repository model doesn't have an AverageRating field yet
                        // We can calculate it on the fly or add a field if needed
                        // For now, we'll just log it
                        _logger.LogInformation("Repository {RepositoryId} has average rating of {AverageRating} from {Count} reviews", 
                            repositoryId, averageRating, reviews.Count);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating repository rating for repository {RepositoryId}", repositoryId);
            }
        }
    }

    public class CreateReviewModel
    {
        [Required]
        public int RepositoryId { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [StringLength(2000)]
        public string? Comment { get; set; }
    }

    public class UpdateReviewModel
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [StringLength(2000)]
        public string? Comment { get; set; }
    }
}

