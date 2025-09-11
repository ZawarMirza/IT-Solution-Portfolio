using System.ComponentModel.DataAnnotations;

namespace Wordpress_Backend.Models
{
    public class Repository
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Domain { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Category { get; set; } = string.Empty; // Free, Premium
        
        public string? GitHubUrl { get; set; }
        
        public string? DownloadUrl { get; set; }
        
        public string? DocumentPreviewUrl { get; set; }
        
        public string? LicenseType { get; set; }
        
        public string? Version { get; set; }
        
        public string Technologies { get; set; } = string.Empty; // JSON array of technologies
        
        public string? AccessLevel { get; set; } = "public"; // public, admin, premium
        
        public int Stars { get; set; } = 0;
        
        public int Forks { get; set; } = 0;
        
        public int Downloads { get; set; } = 0;
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string? CreatedBy { get; set; } // User ID who created this
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "active"; // active, archived, private
    }
}
