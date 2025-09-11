using System.ComponentModel.DataAnnotations;

namespace Wordpress_Backend.Models
{
    public class Publication
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Authors { get; set; } = string.Empty; // JSON array of authors
        
        [Required]
        [StringLength(50)]
        public string Domain { get; set; } = string.Empty;
        
        [Required]
        public string Abstract { get; set; } = string.Empty;
        
        public string? ThumbnailUrl { get; set; }
        
        public string? DocumentPreviewUrl { get; set; }
        
        public string? VideoPreviewUrl { get; set; }
        
        public string? DownloadUrl { get; set; }
        
        public DateTime PublishedDate { get; set; }
        
        public int Downloads { get; set; } = 0;
        
        public string Keywords { get; set; } = string.Empty; // JSON array of keywords
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "published"; // published, draft, archived
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string? CreatedBy { get; set; } // User ID who created this
    }
}
