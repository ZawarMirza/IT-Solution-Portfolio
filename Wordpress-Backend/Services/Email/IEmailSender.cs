using System.Threading.Tasks;

namespace Wordpress_Backend.Services.Email
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
    }
}


