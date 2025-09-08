using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Domain { get; set; } = "";

        public int DomainId { get; set; }

        [Required]
        public string Title { get; set; } = "";

        public string Caption { get; set; } = "";

        public string Image { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
    }
}
