using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductAPI.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Caption { get; set; }

        public string? Image { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key for Domain
        public int DomainId { get; set; }
        public virtual Domain Domain { get; set; } = null!;

        // Foreign key for ApplicationUser
        public string CreatedById { get; set; } = string.Empty;
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
    }
}
