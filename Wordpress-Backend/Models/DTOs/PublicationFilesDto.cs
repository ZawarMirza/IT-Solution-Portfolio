using Microsoft.AspNetCore.Http;

namespace Wordpress_Backend.Models.DTOs
{
    public class PublicationFilesDto
    {
        public IFormFile? Thumbnail { get; set; }
        public IFormFile? Document { get; set; }
        public IFormFile? Video { get; set; }
    }
}
