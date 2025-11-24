using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using System.Security.Claims;
using System.Text.Json;
using Wordpress_Backend.Models;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FooterSettingsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly ILogger<FooterSettingsController> _logger;
        private readonly IWebHostEnvironment _env;

        public FooterSettingsController(
            ProductDbContext context,
            ILogger<FooterSettingsController> logger,
            IWebHostEnvironment env)
        {
            _context = context;
            _logger = logger;
            _env = env;
        }

        // GET: api/FooterSettings
        // Get footer settings (public endpoint)
        [HttpGet]
        public async Task<ActionResult<object>> GetFooterSettings()
        {
            try
            {
                var settings = await _context.FooterSettings.FirstOrDefaultAsync();
                
                if (settings == null)
                {
                    // Return default settings if none exist
                    return Ok(new
                    {
                        companyName = "IT Solution Portfolio",
                        companyLogoUrl = "",
                        address = "",
                        phone = "",
                        email = "",
                        mapLocationUrl = "",
                        linkedInUrl = "",
                        linkedInVisible = true,
                        facebookUrl = "",
                        facebookVisible = true,
                        twitterUrl = "",
                        twitterVisible = true,
                        tiktokUrl = "",
                        tiktokVisible = true,
                        youtubeUrl = "https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut",
                        youtubeVisible = true,
                        whatsAppUrl = "",
                        whatsAppVisible = true,
                        footerLinksJson = "[]",
                        copyrightText = "© 2025 IT Solution Portfolio. All Rights Reserved."
                    });
                }

                return Ok(new
                {
                    id = settings.Id,
                    companyName = settings.CompanyName,
                    companyLogoUrl = settings.CompanyLogoUrl,
                    address = settings.Address,
                    phone = settings.Phone,
                    email = settings.Email,
                    mapLocationUrl = settings.MapLocationUrl,
                    linkedInUrl = settings.LinkedInUrl,
                    linkedInVisible = settings.LinkedInVisible,
                    facebookUrl = settings.FacebookUrl,
                    facebookVisible = settings.FacebookVisible,
                    twitterUrl = settings.TwitterUrl,
                    twitterVisible = settings.TwitterVisible,
                    tiktokUrl = settings.TikTokUrl,
                    tiktokVisible = settings.TikTokVisible,
                    youtubeUrl = settings.YouTubeUrl ?? "https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut",
                    youtubeVisible = settings.YouTubeVisible,
                    whatsAppUrl = settings.WhatsAppUrl,
                    whatsAppVisible = settings.WhatsAppVisible,
                    footerLinksJson = settings.FooterLinksJson ?? "[]",
                    copyrightText = settings.CopyrightText ?? "© 2025 IT Solution Portfolio. All Rights Reserved."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching footer settings");
                return StatusCode(500, new { message = "An error occurred while fetching footer settings" });
            }
        }

        // POST: api/FooterSettings/upload-logo
        // Upload logo file (admin only)
        [HttpPost("upload-logo")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadLogo([FromForm] IFormFile logo)
        {
            try
            {
                if (logo == null || logo.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp" };
                var fileExtension = Path.GetExtension(logo.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Allowed types: PNG, JPG, JPEG, GIF, SVG, WEBP" });
                }

                // Validate file size (max 5MB)
                if (logo.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size exceeds 5MB limit" });
                }

                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "footer");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"logo_{Guid.NewGuid():N}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = System.IO.File.Create(filePath))
                {
                    await logo.CopyToAsync(stream);
                }

                var logoUrl = $"/uploads/footer/{fileName}";

                return Ok(new { logoUrl, message = "Logo uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading logo");
                return StatusCode(500, new { message = "An error occurred while uploading the logo" });
            }
        }

        // PUT: api/FooterSettings
        // Update footer settings (admin only)
        [HttpPut]
        [Authorize(Roles = "Admin")]
        [Consumes("application/json", "multipart/form-data")]
        public async Task<IActionResult> UpdateFooterSettings([FromBody] UpdateFooterSettingsModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var settings = await _context.FooterSettings.FirstOrDefaultAsync();
                
                if (settings == null)
                {
                    settings = new FooterSettings();
                    _context.FooterSettings.Add(settings);
                }

                // Update settings
                settings.CompanyName = model.CompanyName;
                settings.CompanyLogoUrl = model.CompanyLogoUrl;
                settings.Address = model.Address;
                settings.Phone = model.Phone;
                settings.Email = model.Email;
                settings.MapLocationUrl = model.MapLocationUrl;
                settings.LinkedInUrl = model.LinkedInUrl;
                settings.LinkedInVisible = model.LinkedInVisible;
                settings.FacebookUrl = model.FacebookUrl;
                settings.FacebookVisible = model.FacebookVisible;
                settings.TwitterUrl = model.TwitterUrl;
                settings.TwitterVisible = model.TwitterVisible;
                settings.TikTokUrl = model.TikTokUrl;
                settings.TikTokVisible = model.TikTokVisible;
                settings.YouTubeUrl = model.YouTubeUrl ?? "https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut";
                settings.YouTubeVisible = model.YouTubeVisible;
                settings.WhatsAppUrl = model.WhatsAppUrl;
                settings.WhatsAppVisible = model.WhatsAppVisible;
                settings.FooterLinksJson = model.FooterLinksJson;
                settings.CopyrightText = model.CopyrightText;
                settings.UpdatedAt = DateTime.UtcNow;
                settings.UpdatedBy = userId;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Footer settings updated successfully",
                    id = settings.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating footer settings");
                return StatusCode(500, new { message = "An error occurred while updating footer settings" });
            }
        }
    }

    public class UpdateFooterSettingsModel
    {
        public string? CompanyName { get; set; }
        public string? CompanyLogoUrl { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? MapLocationUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public bool LinkedInVisible { get; set; } = true;
        public string? FacebookUrl { get; set; }
        public bool FacebookVisible { get; set; } = true;
        public string? TwitterUrl { get; set; }
        public bool TwitterVisible { get; set; } = true;
        public string? TikTokUrl { get; set; }
        public bool TikTokVisible { get; set; } = true;
        public string? YouTubeUrl { get; set; }
        public bool YouTubeVisible { get; set; } = true;
        public string? WhatsAppUrl { get; set; }
        public bool WhatsAppVisible { get; set; } = true;
        public string? FooterLinksJson { get; set; }
        public string? CopyrightText { get; set; }
    }
}

