using Microsoft.AspNetCore.Identity;
using System;

namespace ProductAPI.Models
{
    public class User : IdentityUser
    {
        // Add custom properties here if needed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
