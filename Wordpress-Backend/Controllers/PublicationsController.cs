using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using Wordpress_Backend.Models;
using Wordpress_Backend.Models.DTOs;
using System.Text.Json;
using System.Security.Claims;
using System.IO;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicationsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PublicationsController(ProductDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Publications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Publication>>> GetPublications()
        {
            return await _context.Publications
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Publications/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Publication>> GetPublication(int id)
        {
            var publication = await _context.Publications.FindAsync(id);

            if (publication == null)
            {
                return NotFound();
            }

            return publication;
        }

        // POST: api/Publications
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Publication>> PostPublication(Publication publication)
        {
            publication.CreatedAt = DateTime.UtcNow;
            publication.UpdatedAt = DateTime.UtcNow;
            publication.CreatedBy = User.Identity?.Name;

            _context.Publications.Add(publication);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPublication", new { id = publication.Id }, publication);
        }

        // PUT: api/Publications/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPublication(int id, Publication publication)
        {
            if (id != publication.Id)
            {
                return BadRequest();
            }

            publication.UpdatedAt = DateTime.UtcNow;
            _context.Entry(publication).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PublicationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Publications/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePublication(int id)
        {
            var publication = await _context.Publications.FindAsync(id);
            if (publication == null)
            {
                return NotFound();
            }

            _context.Publications.Remove(publication);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Publications/5/download
        [HttpPost("{id}/download")]
        [Authorize]
        public async Task<IActionResult> IncrementDownload(int id)
        {
            var publication = await _context.Publications.FindAsync(id);
            if (publication == null)
            {
                return NotFound();
            }

            publication.Downloads++;
            await _context.SaveChangesAsync();

            return Ok(new { downloads = publication.Downloads });
        }

        // GET: api/Publications/domains
        [HttpGet("domains")]
        public async Task<ActionResult<IEnumerable<string>>> GetDomains()
        {
            var domains = await _context.Publications
                .Select(p => p.Domain)
                .Distinct()
                .ToListAsync();

            return Ok(domains);
        }

        // POST: api/Publications/{id}/files
        [HttpPost("{id}/files")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFiles(int id, [FromForm] PublicationFilesDto files)
        {
            var publication = await _context.Publications.FindAsync(id);
            if (publication == null)
            {
                return NotFound();
            }

            var baseUploads = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "publications");
            Directory.CreateDirectory(baseUploads);

            // Thumbnail
            if (files.Thumbnail != null && files.Thumbnail.Length > 0)
            {
                var thumbName = $"pub_{id}_thumb_{Guid.NewGuid():N}{Path.GetExtension(files.Thumbnail.FileName)}";
                var thumbPath = Path.Combine(baseUploads, thumbName);
                using (var stream = System.IO.File.Create(thumbPath))
                {
                    await files.Thumbnail.CopyToAsync(stream);
                }
                publication.ThumbnailUrl = $"/uploads/publications/{thumbName}";
            }

            // Document (PDF)
            if (files.Document != null && files.Document.Length > 0)
            {
                var docName = $"pub_{id}_doc_{Guid.NewGuid():N}{Path.GetExtension(files.Document.FileName)}";
                var docPath = Path.Combine(baseUploads, docName);
                using (var stream = System.IO.File.Create(docPath))
                {
                    await files.Document.CopyToAsync(stream);
                }
                // Use DocumentPreviewUrl for preview and DownloadUrl for actual download
                publication.DocumentPreviewUrl = $"/uploads/publications/{docName}";
                publication.DownloadUrl = $"/uploads/publications/{docName}";
            }

            // Video
            if (files.Video != null && files.Video.Length > 0)
            {
                var videoName = $"pub_{id}_video_{Guid.NewGuid():N}{Path.GetExtension(files.Video.FileName)}";
                var videoPath = Path.Combine(baseUploads, videoName);
                using (var stream = System.IO.File.Create(videoPath))
                {
                    await files.Video.CopyToAsync(stream);
                }
                publication.VideoPreviewUrl = $"/uploads/publications/{videoName}";
            }

            publication.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                publication.Id,
                publication.ThumbnailUrl,
                publication.DocumentPreviewUrl,
                publication.VideoPreviewUrl,
                publication.DownloadUrl
            });
        }

        private bool PublicationExists(int id)
        {
            return _context.Publications.Any(e => e.Id == id);
        }
    }
}
