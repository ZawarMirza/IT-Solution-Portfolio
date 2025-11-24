using System.ComponentModel.DataAnnotations;
using ProductAPI.Models;

namespace Wordpress_Backend.Models
{
    public class Solution
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Subtitle { get; set; }

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Icon { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(100)]
        public string? ActionText { get; set; }

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        public bool IsFeatured { get; set; } = false;

        public string? Tags { get; set; } // Stored as JSON array

        public string? Features { get; set; } // Stored as JSON array

        [Required]
        public int DomainId { get; set; }

        public Domain? Domain { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public string? CreatedById { get; set; }

        public ApplicationUser? CreatedBy { get; set; }
    }
}

