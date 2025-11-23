using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ProductAPI.Models;

namespace ProductAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        
        public bool IsBlocked { get; set; } = false;
        
        public string? BlockReason { get; set; }
        
        public DateTime? BlockedAt { get; set; }
        
        public string? BlockedBy { get; set; } // Admin user ID who blocked this user
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public DateTime? LastLogin { get; set; }
        
        public string? RefreshToken { get; set; }
        
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public string? VerificationTokenHash { get; set; }

        public DateTime? VerificationTokenExpiresAt { get; set; }

        public DateTime? EmailVerifiedAt { get; set; }

        public DateTime? LastVerificationEmailSentAt { get; set; }
        
        // Navigation property for products created by this user
        public virtual ICollection<Product> Products { get; set; } = new HashSet<Product>();
    }
}
