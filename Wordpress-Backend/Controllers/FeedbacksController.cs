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
    public class FeedbacksController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly EmailTemplateService _emailTemplateService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FeedbacksController> _logger;

        public FeedbacksController(
            ProductDbContext context,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender,
            EmailTemplateService emailTemplateService,
            IConfiguration configuration,
            ILogger<FeedbacksController> logger)
        {
            _context = context;
            _userManager = userManager;
            _emailSender = emailSender;
            _emailTemplateService = emailTemplateService;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/Feedbacks
        // Submit feedback (public endpoint)
        [HttpPost]
        public async Task<ActionResult<Feedback>> SubmitFeedback([FromBody] CreateFeedbackModel model)
        {
            try
            {
                if (!model.ConsentGiven)
                {
                    return BadRequest(new { message = "You must consent to the privacy policy to submit feedback" });
                }

                var feedback = new Feedback
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    WorkEmail = model.WorkEmail,
                    CompanyName = model.CompanyName,
                    Country = model.Country,
                    HowCanWeHelp = model.HowCanWeHelp,
                    ProductServiceInterest = model.ProductServiceInterest,
                    HowDidYouHearAboutUs = model.HowDidYouHearAboutUs,
                    ConsentGiven = model.ConsentGiven,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.Feedbacks.Add(feedback);
                await _context.SaveChangesAsync();

                // Send email notification to all admin users
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                
                try
                {
                    var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                    _logger.LogInformation("Found {Count} admin users to notify about feedback", adminUsers.Count);
                    
                    foreach (var admin in adminUsers)
                    {
                        if (!string.IsNullOrEmpty(admin.Email))
                        {
                            try
                            {
                                var emailBody = _emailTemplateService.GenerateFeedbackNotificationEmail(
                                    $"{feedback.FirstName} {feedback.LastName}",
                                    feedback.WorkEmail,
                                    feedback.CompanyName,
                                    feedback.Country,
                                    feedback.HowCanWeHelp,
                                    feedback.ProductServiceInterest,
                                    feedback.HowDidYouHearAboutUs,
                                    frontendUrl,
                                    feedback.Id
                                );

                                await _emailSender.SendEmailAsync(
                                    admin.Email,
                                    $"New Feedback Received - {feedback.FirstName} {feedback.LastName}",
                                    emailBody
                                );

                                _logger.LogInformation("Feedback notification email sent to admin {Email} for feedback {FeedbackId}", 
                                    admin.Email, feedback.Id);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to send feedback notification email to admin {Email}", admin.Email);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending feedback notification emails to admins");
                }

                return Ok(new
                {
                    message = "Feedback submitted successfully. Thank you for contacting us!",
                    id = feedback.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting feedback");
                return StatusCode(500, new { message = "An error occurred while submitting feedback" });
            }
        }

        // GET: api/Feedbacks
        // Get all feedbacks (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllFeedbacks()
        {
            try
            {
                var feedbacks = await _context.Feedbacks
                    .OrderByDescending(f => f.SubmittedAt)
                    .ToListAsync();

                var result = feedbacks.Select(f => new
                {
                    id = f.Id,
                    firstName = f.FirstName,
                    lastName = f.LastName,
                    workEmail = f.WorkEmail,
                    companyName = f.CompanyName,
                    country = f.Country,
                    howCanWeHelp = f.HowCanWeHelp,
                    productServiceInterest = f.ProductServiceInterest,
                    howDidYouHearAboutUs = f.HowDidYouHearAboutUs,
                    consentGiven = f.ConsentGiven,
                    submittedAt = f.SubmittedAt,
                    isRead = f.IsRead,
                    readAt = f.ReadAt,
                    readBy = f.ReadBy
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching feedbacks");
                return StatusCode(500, new { message = "An error occurred while fetching feedbacks" });
            }
        }

        // GET: api/Feedbacks/{id}
        // Get a specific feedback (admin only)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetFeedback(int id)
        {
            try
            {
                var feedback = await _context.Feedbacks.FindAsync(id);
                if (feedback == null)
                {
                    return NotFound(new { message = "Feedback not found" });
                }

                // Mark as read
                if (!feedback.IsRead)
                {
                    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    feedback.IsRead = true;
                    feedback.ReadAt = DateTime.UtcNow;
                    feedback.ReadBy = userId;
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    id = feedback.Id,
                    firstName = feedback.FirstName,
                    lastName = feedback.LastName,
                    workEmail = feedback.WorkEmail,
                    companyName = feedback.CompanyName,
                    country = feedback.Country,
                    howCanWeHelp = feedback.HowCanWeHelp,
                    productServiceInterest = feedback.ProductServiceInterest,
                    howDidYouHearAboutUs = feedback.HowDidYouHearAboutUs,
                    consentGiven = feedback.ConsentGiven,
                    submittedAt = feedback.SubmittedAt,
                    isRead = feedback.IsRead,
                    readAt = feedback.ReadAt,
                    readBy = feedback.ReadBy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching feedback");
                return StatusCode(500, new { message = "An error occurred while fetching feedback" });
            }
        }

        // DELETE: api/Feedbacks/{id}
        // Delete feedback (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                var feedback = await _context.Feedbacks.FindAsync(id);
                if (feedback == null)
                {
                    return NotFound(new { message = "Feedback not found" });
                }

                _context.Feedbacks.Remove(feedback);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Feedback deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting feedback");
                return StatusCode(500, new { message = "An error occurred while deleting feedback" });
            }
        }

        // PUT: api/Feedbacks/{id}/mark-read
        // Mark feedback as read (admin only)
        [HttpPut("{id}/mark-read")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var feedback = await _context.Feedbacks.FindAsync(id);
                if (feedback == null)
                {
                    return NotFound(new { message = "Feedback not found" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                feedback.IsRead = true;
                feedback.ReadAt = DateTime.UtcNow;
                feedback.ReadBy = userId;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Feedback marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking feedback as read");
                return StatusCode(500, new { message = "An error occurred while marking feedback as read" });
            }
        }
    }

    public class CreateFeedbackModel
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string WorkEmail { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;
        
        [Required]
        [StringLength(2000)]
        public string HowCanWeHelp { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string ProductServiceInterest { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string HowDidYouHearAboutUs { get; set; } = string.Empty;
        
        [Required]
        public bool ConsentGiven { get; set; }
    }
}

