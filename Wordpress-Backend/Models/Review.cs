using System.ComponentModel.DataAnnotations;
using ProductAPI.Models;

namespace Wordpress_Backend.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty; // User who wrote the review
        
        [Required]
        public int RepositoryId { get; set; } // Repository being reviewed
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; } // 1-5 stars
        
        [StringLength(2000)]
        public string? Comment { get; set; } // Optional comment/review text
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual Repository? Repository { get; set; }
    }
}

