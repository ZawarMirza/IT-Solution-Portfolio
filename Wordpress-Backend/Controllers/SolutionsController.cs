using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Data;
using ProductAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using Wordpress_Backend.Models;

namespace Wordpress_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SolutionsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly ILogger<SolutionsController> _logger;

        public SolutionsController(
            ProductDbContext context,
            ILogger<SolutionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private static List<string> DeserializeList(string? data)
        {
            if (string.IsNullOrWhiteSpace(data)) return new List<string>();

            try
            {
                var result = JsonSerializer.Deserialize<List<string>>(data);
                return result?.Where(item => !string.IsNullOrWhiteSpace(item)).Select(item => item.Trim()).ToList() ?? new List<string>();
            }
            catch
            {
                return data.Split(',', StringSplitOptions.RemoveEmptyEntries)
                           .Select(item => item.Trim())
                           .ToList();
            }
        }

        private static string SerializeList(IEnumerable<string>? items)
        {
            if (items == null) return "[]";
            var normalized = items.Where(item => !string.IsNullOrWhiteSpace(item))
                                  .Select(item => item.Trim())
                                  .ToList();
            return JsonSerializer.Serialize(normalized);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSolutions()
        {
            var solutions = await _context.Solutions
                .Include(s => s.Domain)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = solutions.Select(s => new
            {
                s.Id,
                s.Title,
                s.Subtitle,
                s.Description,
                s.Icon,
                s.ImageUrl,
                s.ActionText,
                s.ActionUrl,
                s.IsFeatured,
                Domain = s.Domain != null ? new { s.Domain.Id, s.Domain.Name } : null,
                Tags = DeserializeList(s.Tags),
                Features = DeserializeList(s.Features),
                s.CreatedAt,
                s.UpdatedAt
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSolution(int id)
        {
            var solution = await _context.Solutions
                .Include(s => s.Domain)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (solution == null)
            {
                return NotFound(new { message = "Solution not found" });
            }

            return Ok(new
            {
                solution.Id,
                solution.Title,
                solution.Subtitle,
                solution.Description,
                solution.Icon,
                solution.ImageUrl,
                solution.ActionText,
                solution.ActionUrl,
                solution.IsFeatured,
                solution.DomainId,
                Domain = solution.Domain != null ? new { solution.Domain.Id, solution.Domain.Name } : null,
                Tags = DeserializeList(solution.Tags),
                Features = DeserializeList(solution.Features),
                solution.CreatedAt,
                solution.UpdatedAt
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> CreateSolution([FromBody] SolutionCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var domain = await _context.Domains.FindAsync(dto.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Invalid domain selected" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var solution = new Solution
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                Description = dto.Description,
                Icon = dto.Icon,
                ImageUrl = dto.ImageUrl,
                ActionText = dto.ActionText,
                ActionUrl = dto.ActionUrl,
                IsFeatured = dto.IsFeatured,
                DomainId = dto.DomainId,
                Tags = SerializeList(dto.Tags),
                Features = SerializeList(dto.Features),
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Solutions.Add(solution);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSolution), new { id = solution.Id }, new
            {
                solution.Id,
                solution.Title,
                solution.Subtitle,
                solution.Description,
                solution.Icon,
                solution.ImageUrl,
                solution.ActionText,
                solution.ActionUrl,
                solution.IsFeatured,
                Domain = new { domain.Id, domain.Name },
                Tags = DeserializeList(solution.Tags),
                Features = DeserializeList(solution.Features),
                solution.CreatedAt
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSolution(int id, [FromBody] SolutionUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var solution = await _context.Solutions.FindAsync(id);
            if (solution == null)
            {
                return NotFound(new { message = "Solution not found" });
            }

            var domain = await _context.Domains.FindAsync(dto.DomainId);
            if (domain == null)
            {
                return BadRequest(new { message = "Invalid domain selected" });
            }

            solution.Title = dto.Title;
            solution.Subtitle = dto.Subtitle;
            solution.Description = dto.Description;
            solution.Icon = dto.Icon;
            solution.ImageUrl = dto.ImageUrl;
            solution.ActionText = dto.ActionText;
            solution.ActionUrl = dto.ActionUrl;
            solution.IsFeatured = dto.IsFeatured;
            solution.DomainId = dto.DomainId;
            solution.Tags = SerializeList(dto.Tags);
            solution.Features = SerializeList(dto.Features);
            solution.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Solution updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSolution(int id)
        {
            var solution = await _context.Solutions.FindAsync(id);
            if (solution == null)
            {
                return NotFound(new { message = "Solution not found" });
            }

            _context.Solutions.Remove(solution);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Solution deleted successfully" });
        }
    }

    public class SolutionCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Subtitle { get; set; }

        public string? Description { get; set; }

        [Required]
        public int DomainId { get; set; }

        public string? Icon { get; set; }

        public string? ImageUrl { get; set; }

        public string? ActionText { get; set; }

        public string? ActionUrl { get; set; }

        public bool IsFeatured { get; set; } = false;

        public List<string>? Tags { get; set; }

        public List<string>? Features { get; set; }
    }

    public class SolutionUpdateDto : SolutionCreateDto { }
}

