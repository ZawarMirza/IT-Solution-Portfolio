using System.ComponentModel.DataAnnotations;

namespace Wordpress_Backend.Models
{
    public class FooterSettings
    {
        public int Id { get; set; }
        
        // Company Info
        [StringLength(200)]
        public string? CompanyName { get; set; }
        
        [StringLength(500)]
        public string? CompanyLogoUrl { get; set; }
        
        // Contact Information
        [StringLength(500)]
        public string? Address { get; set; }
        
        [StringLength(50)]
        public string? Phone { get; set; }
        
        [StringLength(255)]
        public string? Email { get; set; }
        
        [StringLength(500)]
        public string? MapLocationUrl { get; set; }
        
        // Social Media Links
        [StringLength(500)]
        public string? LinkedInUrl { get; set; }
        
        public bool LinkedInVisible { get; set; } = true;
        
        [StringLength(500)]
        public string? FacebookUrl { get; set; }
        
        public bool FacebookVisible { get; set; } = true;
        
        [StringLength(500)]
        public string? TwitterUrl { get; set; }
        
        public bool TwitterVisible { get; set; } = true;
        
        [StringLength(500)]
        public string? TikTokUrl { get; set; }
        
        public bool TikTokVisible { get; set; } = true;
        
        [StringLength(500)]
        public string? YouTubeUrl { get; set; }
        
        public bool YouTubeVisible { get; set; } = true;
        
        [StringLength(500)]
        public string? WhatsAppUrl { get; set; }
        
        public bool WhatsAppVisible { get; set; } = true;
        
        // Footer Links (stored as JSON)
        public string? FooterLinksJson { get; set; }
        
        // Copyright Text
        [StringLength(200)]
        public string? CopyrightText { get; set; }
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string? UpdatedBy { get; set; } // Admin User ID
    }
}

