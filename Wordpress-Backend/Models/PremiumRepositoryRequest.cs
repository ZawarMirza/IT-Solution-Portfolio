using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using ProductAPI.Models;

namespace Wordpress_Backend.Models
{
    public class PremiumRepositoryRequest
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty; // User who requested
        
        [Required]
        public int RepositoryId { get; set; } // Repository being requested
        
        [StringLength(500)]
        public string? Message { get; set; } // Optional message from user
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected
        
        public string? AdminNotes { get; set; } // Admin's notes when approving/rejecting
        
        public string? ApprovedBy { get; set; } // Admin user ID who approved/rejected
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReviewedAt { get; set; } // When admin reviewed the request
        
        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual Repository? Repository { get; set; }
    }
}

