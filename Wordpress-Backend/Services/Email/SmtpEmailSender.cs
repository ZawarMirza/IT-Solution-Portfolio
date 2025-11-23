using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
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
            // For Gmail, the From address must match the authenticated username
            // Use Username as FromEmail if FromEmail doesn't match
            var fromEmail = _settings.FromEmail;
            if (!string.IsNullOrEmpty(_settings.Username) && 
                !_settings.FromEmail.Equals(_settings.Username, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("FromEmail ({FromEmail}) doesn't match Username ({Username}). Using Username as FromEmail for Gmail compatibility.", 
                    _settings.FromEmail, _settings.Username);
                fromEmail = _settings.Username;
            }

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, _settings.FromName),
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
                _logger.LogInformation("Sending email to {Email} via SMTP {Host}:{Port}", 
                    toEmail, _settings.Host, _settings.Port);
                _logger.LogDebug("Email from: {FromEmail}, Subject: {Subject}", 
                    _settings.FromEmail, subject);
                
                await client.SendMailAsync(message);
                _logger.LogInformation("✓ Email sent successfully to {Email}", toEmail);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "✗ SMTP error while sending email to {Email}. Status: {Status}, Message: {Message}", 
                    toEmail, smtpEx.StatusCode, smtpEx.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "✗ General error while sending email to {Email}. Error: {Error}", 
                    toEmail, ex.Message);
                throw;
            }
        }
    }
}


