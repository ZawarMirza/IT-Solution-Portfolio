using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class RefreshTokenModel
    {
        [Required]
        public string Token { get; set; }
    }

    public class UpdateProfileModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        [EmailAddress]
        public string Email { get; set; }
    }

    public class ChangePasswordModel
    {
        [Required]
        public string CurrentPassword { get; set; }
        
        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        public string NewPassword { get; set; }
    }
}
