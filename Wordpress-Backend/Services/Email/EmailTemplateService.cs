using System;
using System.Net;
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

        public string GeneratePasswordResetEmail(string firstName, string resetLink)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Reset Your Password</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #5568d3; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .link { color: #667eea; word-break: break-all; }");
            html.AppendLine("        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>Password Reset Request</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>We received a request to reset your password for your IT Solution Portfolio account. Click the button below to reset your password:</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{resetLink}\" class=\"button\">Reset Password</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Or copy and paste this link into your browser:</p>");
            html.AppendLine($"            <p><a href=\"{resetLink}\" class=\"link\">{resetLink}</a></p>");
            html.AppendLine("            <div class=\"warning\">");
            html.AppendLine("                <p><strong>⚠️ Security Notice:</strong></p>");
            html.AppendLine("                <p>This password reset link will expire in 1 hour for security reasons.</p>");
            html.AppendLine("                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>");
            html.AppendLine("            </div>");
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

        public string GenerateUserBlockedEmail(string firstName, string reason, string contactEmail = "support@example.com")
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Account Blocked</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .contact-link { color: #667eea; text-decoration: none; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>⚠️ Account Blocked</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>We regret to inform you that your account with IT Solution Portfolio has been temporarily blocked by an administrator.</p>");
            html.AppendLine("            <div class=\"warning\">");
            html.AppendLine("                <p><strong>⚠️ Important:</strong></p>");
            html.AppendLine("                <p>While your account is blocked, you will not be able to:</p>");
            html.AppendLine("                <ul style=\"margin: 10px 0; padding-left: 20px;\">");
            html.AppendLine("                    <li>Log in to your account</li>");
            html.AppendLine("                    <li>Access your dashboard</li>");
            html.AppendLine("                    <li>Download resources</li>");
            html.AppendLine("                    <li>Use any platform features</li>");
            html.AppendLine("                </ul>");
            html.AppendLine("            </div>");
            
            if (!string.IsNullOrWhiteSpace(reason))
            {
                html.AppendLine("            <div class=\"reason-box\">");
                html.AppendLine("                <p><strong>Reason for Blocking:</strong></p>");
                html.AppendLine($"                <p>{System.Net.WebUtility.HtmlEncode(reason)}</p>");
                html.AppendLine("            </div>");
            }
            
            html.AppendLine("            <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team:</p>");
            html.AppendLine($"            <p>Email: <a href=\"mailto:{contactEmail}\" class=\"contact-link\">{contactEmail}</a></p>");
            html.AppendLine("            <p>We will review your case and respond as soon as possible.</p>");
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

        public string GenerateUserUnblockedEmail(string firstName)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Account Unblocked</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #059669; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>✓ Account Unblocked</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <div class=\"success-box\">");
            html.AppendLine("                <p><strong>Good News!</strong></p>");
            html.AppendLine("                <p>Your account with IT Solution Portfolio has been unblocked and is now active again.</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>You can now log in to your account and access all platform features.</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine("                <a href=\"http://localhost:3000/login\" class=\"button\">Log In to Your Account</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>");
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
