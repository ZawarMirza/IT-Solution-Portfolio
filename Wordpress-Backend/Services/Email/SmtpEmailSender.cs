using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Wordpress_Backend.Services.Email
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IOptions<EmailSettings> options, ILogger<SmtpEmailSender> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(toEmail));

            using var client = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = _settings.UseSsl,
                Credentials = new NetworkCredential(_settings.Username, _settings.Password)
            };

            try
            {
                await client.SendMailAsync(message);
                _logger.LogInformation("Verification email sent to {Email}", toEmail);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error while sending email to {Email}", toEmail);
                throw;
            }
        }
    }
}


