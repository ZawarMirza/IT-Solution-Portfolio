using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Caption { get; set; }

        [Required]
        public int DomainId { get; set; }

        public IFormFile? Image { get; set; }
    }
}
