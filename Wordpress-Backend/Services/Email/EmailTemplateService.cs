using System;
using System.Text;

namespace Wordpress_Backend.Services.Email
{
    public class EmailTemplateService
    {
        public string BaseUrl { get; private set; }

        public EmailTemplateService(string baseUrl = "http://localhost:3000")
        {
            BaseUrl = baseUrl;
        }

        public string GenerateVerificationEmail(string firstName, string verificationLink)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Verify Your Email</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #5568d3; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .link { color: #667eea; word-break: break-all; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>Welcome to IT Solution Portfolio!</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>Thank you for registering with IT Solution Portfolio. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{verificationLink}\" class=\"button\">Verify Email Address</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Or copy and paste this link into your browser:</p>");
            html.AppendLine($"            <p><a href=\"{verificationLink}\" class=\"link\">{verificationLink}</a></p>");
            html.AppendLine("            <p><strong>This verification link will expire in 24 hours.</strong></p>");
            html.AppendLine("            <p>If you did not create an account with us, please ignore this email.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        public string GenerateResendVerificationEmail(string firstName, string verificationLink)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Resend Verification Email</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #5568d3; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .link { color: #667eea; word-break: break-all; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>Email Verification Request</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>You requested a new verification email. Please click the button below to verify your email address:</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{verificationLink}\" class=\"button\">Verify Email Address</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Or copy and paste this link into your browser:</p>");
            html.AppendLine($"            <p><a href=\"{verificationLink}\" class=\"link\">{verificationLink}</a></p>");
            html.AppendLine("            <p><strong>This verification link will expire in 24 hours.</strong></p>");
            html.AppendLine("            <p>If you did not request this email, please ignore it.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }
    }
}
