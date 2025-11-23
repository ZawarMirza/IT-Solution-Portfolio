using System.ComponentModel.DataAnnotations;

namespace Wordpress_Backend.Models
{
    public class Feedback
    {
        public int Id { get; set; }
        
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
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        public DateTime? ReadAt { get; set; }
        
        public string? ReadBy { get; set; } // Admin User ID who read it
    }
}

