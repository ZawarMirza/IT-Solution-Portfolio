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
    public class RepositoriesController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public RepositoriesController(ProductDbContext context)
        {
            _context = context;
        }

        // GET: api/Repositories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Repository>>> GetRepositories()
        {
            return await _context.Repositories
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Repositories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Repository>> GetRepository(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);

            if (repository == null)
            {
                return NotFound();
            }

            return repository;
        }

        // POST: api/Repositories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Repository>> PostRepository(Repository repository)
        {
            repository.CreatedAt = DateTime.UtcNow;
            repository.LastUpdated = DateTime.UtcNow;
            repository.CreatedBy = User.Identity?.Name;

            _context.Repositories.Add(repository);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRepository", new { id = repository.Id }, repository);
        }

        // PUT: api/Repositories/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutRepository(int id, Repository repository)
        {
            if (id != repository.Id)
            {
                return BadRequest();
            }

            repository.LastUpdated = DateTime.UtcNow;
            _context.Entry(repository).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RepositoryExists(id))
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

        // DELETE: api/Repositories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRepository(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);
            if (repository == null)
            {
                return NotFound();
            }

            _context.Repositories.Remove(repository);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Repositories/5/download
        [HttpPost("{id}/download")]
        [Authorize]
        public async Task<IActionResult> IncrementDownload(int id)
        {
            var repository = await _context.Repositories.FindAsync(id);
            if (repository == null)
            {
                return NotFound();
            }

            repository.Downloads++;
            await _context.SaveChangesAsync();

            return Ok(new { downloads = repository.Downloads });
        }

        // GET: api/Repositories/domains
        [HttpGet("domains")]
        public async Task<ActionResult<IEnumerable<string>>> GetDomains()
        {
            var domains = await _context.Repositories
                .Select(r => r.Domain)
                .Distinct()
                .ToListAsync();

            return Ok(domains);
        }

        // GET: api/Repositories/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _context.Repositories
                .Select(r => r.Category)
                .Distinct()
                .ToListAsync();

            return Ok(categories);
        }

        private bool RepositoryExists(int id)
        {
            return _context.Repositories.Any(e => e.Id == id);
        }
    }
}
