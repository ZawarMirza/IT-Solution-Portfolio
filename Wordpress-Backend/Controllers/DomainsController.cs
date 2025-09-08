using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using ProductAPI.Models;

namespace Wordpress_Backend.Controllers
{
    [Route("api/domains")]
    [ApiController]
    public class DomainsController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public DomainsController(ProductDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Domain>>> GetAll() =>
            await _context.Domains.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Domain>> GetById(int id)
        {
            var domain = await _context.Domains.FindAsync(id);
            return domain == null ? NotFound() : Ok(domain);
        }

        [HttpPost]
        public async Task<ActionResult<Domain>> Create(Domain domain)
        {
            _context.Domains.Add(domain);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = domain.Id }, domain);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Domain updated)
        {
            if (id != updated.Id) return BadRequest();

            _context.Entry(updated).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(updated);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Domains.Any(d => d.Id == id))
                    return NotFound();
                else
                    throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var domain = await _context.Domains.FindAsync(id);
            if (domain == null) return NotFound();

            _context.Domains.Remove(domain);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Delete successfully" });
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetTotalCount()
        {
            var count = await _context.Domains.CountAsync();
            return Ok(count);
        }

        [HttpGet("test")]
        public IActionResult TestEndpoint()
        {
            return Ok("DomainsController is accessible");
        }
    }
}
