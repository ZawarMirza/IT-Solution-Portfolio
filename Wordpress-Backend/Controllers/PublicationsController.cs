using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using Wordpress_Backend.Models;
using System.Text.Json;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicationsController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public PublicationsController(ProductDbContext context)
        {
            _context = context;
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

        private bool PublicationExists(int id)
        {
            return _context.Publications.Any(e => e.Id == id);
        }
    }
}
