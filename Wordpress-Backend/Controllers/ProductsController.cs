using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using ProductAPI.Models;
using ProductAPI.Models.DTOs;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(ProductDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data", "application/x-www-form-urlencoded", "application/json")]
        public async Task<ActionResult<Product>> Create([FromForm] ProductCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // Validate domain exists
            var domainExists = await _context.Domains.AnyAsync(d => d.Id == dto.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Invalid DomainId" });
            }

            // Map DTO to entity
            var product = new Product
            {
                Title = dto.Title,
                Caption = dto.Caption,
                DomainId = dto.DomainId,
                CreatedAt = DateTime.UtcNow
            };

            // Assign creator from token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                product.CreatedById = userId;
            }
            else
            {
                // Fallback to first available user to satisfy FK (prevents 500s during unauthenticated seeding/testing)
                var firstUser = await _context.Users.FirstOrDefaultAsync();
                if (firstUser != null)
                {
                    product.CreatedById = firstUser.Id;
                }
            }

            // Handle optional image upload
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"product_{Guid.NewGuid():N}{Path.GetExtension(dto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await dto.Image.CopyToAsync(stream);
                }
                product.Image = $"/uploads/{fileName}";
            }

            _context.Products.Add(product);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to save product", detail = ex.Message });
            }

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data", "application/x-www-form-urlencoded", "application/json")]
        public async Task<IActionResult> Update(int id, [FromForm] ProductCreateDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            // Validate domain exists
            var domainExists = await _context.Domains.AnyAsync(d => d.Id == dto.DomainId);
            if (!domainExists)
            {
                return BadRequest(new { message = "Invalid DomainId" });
            }

            product.Title = dto.Title;
            product.Caption = dto.Caption;
            product.DomainId = dto.DomainId;

            // Handle optional new image
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"product_{Guid.NewGuid():N}{Path.GetExtension(dto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await dto.Image.CopyToAsync(stream);
                }
                product.Image = $"/uploads/{fileName}";
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(product);
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
