using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Domain
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for Products
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
