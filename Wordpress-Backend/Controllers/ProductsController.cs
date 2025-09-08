using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using ProductAPI.Models;
using System.Globalization;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public ProductsController(ProductDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var products = await _context.Products
                .Include(p => p.CreatedBy)
                .Include(p => p.Domain)
                .Select(p => new
                {
                    p.Id,
                    Domain = p.Domain.Name,
                    p.DomainId,
                    p.Title,
                    p.Caption,
                    p.Image,
                    p.CreatedAt,
                    CreatedByUsername = p.CreatedBy != null ? p.CreatedBy.UserName : "N/A"
                })
                .ToListAsync();
            return Ok(products);
        }

        [HttpGet("domain/{domain}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByDomain(string domain)
        {
            var products = await _context.Products
                .Include(p => p.CreatedBy)
                .Include(p => p.Domain)
                .Where(p => p.Domain != null && 
                    string.Equals(p.Domain.Name, domain, StringComparison.OrdinalIgnoreCase))
                .Select(p => new
                {
                    p.Id,
                    Domain = p.Domain.Name,
                    p.DomainId,
                    p.Title,
                    p.Caption,
                    p.Image,
                    p.CreatedAt,
                    CreatedByUsername = p.CreatedBy != null ? p.CreatedBy.UserName : "N/A"
                })
                .ToListAsync();

            return products.Count == 0 ? NotFound() : Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.CreatedBy)
                .Include(p => p.Domain)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    Domain = p.Domain != null ? p.Domain.Name : "N/A",
                    p.DomainId,
                    p.Title,
                    p.Caption,
                    p.Image,
                    p.CreatedAt,
                    CreatedByUsername = p.CreatedBy != null ? p.CreatedBy.UserName : "N/A"
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> Create(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Product updated)
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
                if (!_context.Products.Any(p => p.Id == id))
                    return NotFound();
                else
                    throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deleted successfully" });
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetTotalCount()
        {
            var count = await _context.Products.CountAsync();
            return Ok(count);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecent(int limit = 5)
        {
            var recentProducts = await _context.Products
                .Include(p => p.CreatedBy)
                .Include(p => p.Domain)
                .OrderByDescending(p => p.Id)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    Domain = p.Domain != null ? p.Domain.Name : "N/A",
                    p.DomainId,
                    p.Title,
                    p.Caption,
                    p.Image,
                    p.CreatedAt,
                    CreatedByUsername = p.CreatedBy != null ? p.CreatedBy.UserName : "N/A"
                })
                .ToListAsync();
            return Ok(recentProducts);
        }

        [HttpPost("update-creators")]
        public async Task<ActionResult> UpdateProductCreators()
        {
            var firstUser = await _context.Users.FirstOrDefaultAsync();
            if (firstUser == null)
            {
                return NotFound(new { message = "No users found to assign as creator." });
            }

            var products = await _context.Products
                .Where(p => p.CreatedById == null || p.CreatedById == "")
                .ToListAsync();

            int updatedCount = 0;
            foreach (var product in products)
            {
                product.CreatedById = firstUser.Id;
                _context.Update(product);
                updatedCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Updated creator for {updatedCount} products." });
        }
    }
}
