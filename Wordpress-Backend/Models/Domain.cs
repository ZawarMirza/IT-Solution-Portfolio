using System;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Domain
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
