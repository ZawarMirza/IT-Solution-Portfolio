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

        public string GeneratePremiumRequestApprovalEmail(string firstName, string repositoryName, string baseUrl)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Premium Repository Access Approved</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #16a34a; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>✅ Access Approved!</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>Great news! Your request for premium repository access has been approved by our admin team.</p>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>You can now download and access this premium repository content.</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{baseUrl}/products\" class=\"button\">View Repository</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString().Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName));
        }

        public string GeneratePremiumRequestRejectionEmail(string firstName, string repositoryName, string reason)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Premium Repository Access Request Rejected</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>Request Rejected</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>We regret to inform you that your request for premium repository access has been reviewed and unfortunately cannot be approved at this time.</p>");
            html.AppendLine("            <div class=\"reason-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("                <p><strong>Reason:</strong></p>");
            html.AppendLine("                <p>{System.Net.WebUtility.HtmlEncode(reason)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>If you have any questions about this decision, please contact our support team.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName))
                .Replace("{System.Net.WebUtility.HtmlEncode(reason)}", System.Net.WebUtility.HtmlEncode(reason));
        }

        public string GeneratePremiumRequestNotificationEmail(string firstName, string repositoryName, string baseUrl)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Premium Repository Access Request Submitted</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>📧 Request Submitted</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>Thank you for requesting access to a premium repository. Your request has been successfully submitted and is now pending review by our admin team.</p>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Our team will review your request and notify you via email once a decision has been made. This process typically takes 1-2 business days.</p>");
            html.AppendLine("            <p>You can check the status of your request at any time by logging into your account.</p>");
            html.AppendLine("            <p>If you have any questions, please don't hesitate to contact our support team.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString().Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName));
        }

        public string GeneratePremiumRequestAdminNotificationEmail(string userName, string userEmail, string repositoryName, string repositoryDescription, string userMessage, string baseUrl, int requestId)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>New Premium Repository Access Request</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #2563eb; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .user-info { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>🔔 New Premium Access Request</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine("            <p>Hello Admin,</p>");
            html.AppendLine("            <p>A new request for premium repository access has been submitted and requires your review.</p>");
            html.AppendLine("            <div class=\"user-info\">");
            html.AppendLine("                <p><strong>Requested By:</strong> {System.Net.WebUtility.HtmlEncode(userName)}</p>");
            html.AppendLine("                <p><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(userEmail)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("                <p><strong>Description:</strong> {System.Net.WebUtility.HtmlEncode(repositoryDescription)}</p>");
            if (!string.IsNullOrWhiteSpace(userMessage))
            {
                html.AppendLine("                <p><strong>User Message:</strong></p>");
                html.AppendLine("                <p>{System.Net.WebUtility.HtmlEncode(userMessage)}</p>");
            }
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Please review this request and take appropriate action (approve or reject) from the admin dashboard.</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{baseUrl}/admin/premium-requests\" class=\"button\">Review Request</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Request ID: <strong>{requestId}</strong></p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio System</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(userName)}", System.Net.WebUtility.HtmlEncode(userName))
                .Replace("{System.Net.WebUtility.HtmlEncode(userEmail)}", System.Net.WebUtility.HtmlEncode(userEmail))
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName))
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryDescription)}", System.Net.WebUtility.HtmlEncode(repositoryDescription ?? "No description available"))
                .Replace("{System.Net.WebUtility.HtmlEncode(userMessage)}", System.Net.WebUtility.HtmlEncode(userMessage ?? "No message provided"))
                .Replace("{requestId}", requestId.ToString());
        }

        public string GeneratePremiumRequestUnapprovalEmail(string firstName, string repositoryName, string reason)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Premium Repository Access Revoked</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>⚠️ Access Revoked</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>We regret to inform you that your previously approved access to a premium repository has been revoked by an administrator.</p>");
            html.AppendLine("            <div class=\"reason-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("                <p><strong>Reason:</strong></p>");
            html.AppendLine("                <p>{System.Net.WebUtility.HtmlEncode(reason)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>You will no longer be able to download or access this premium repository content.</p>");
            html.AppendLine("            <p>If you have any questions about this decision, please contact our support team.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName))
                .Replace("{System.Net.WebUtility.HtmlEncode(reason)}", System.Net.WebUtility.HtmlEncode(reason));
        }

        public string GenerateReviewSubmittedEmail(string firstName, string repositoryName, int rating, string baseUrl)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>Review Submitted Successfully</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .rating { color: #f59e0b; font-size: 24px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>⭐ Review Submitted!</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine($"            <p>Hello {firstName},</p>");
            html.AppendLine("            <p>Thank you for taking the time to review a repository on IT Solution Portfolio!</p>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("                <p><strong>Your Rating:</strong> <span class=\"rating\">{rating} ⭐</span></p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Your review helps other users make informed decisions and helps us improve our content.</p>");
            html.AppendLine("            <p>You can view and manage your reviews from your dashboard.</p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio Team</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName))
                .Replace("{rating}", rating.ToString());
        }

        public string GenerateReviewAdminNotificationEmail(string userName, string userEmail, string repositoryName, int rating, string comment, string baseUrl, int reviewId)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>New Review Submitted</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #2563eb; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .user-info { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .rating { color: #f59e0b; font-size: 24px; }");
            html.AppendLine("        .comment-box { background: #f3f4f6; border-left: 4px solid #9ca3af; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>⭐ New Review Submitted</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine("            <p>Hello Admin,</p>");
            html.AppendLine("            <p>A new review has been submitted for a repository.</p>");
            html.AppendLine("            <div class=\"user-info\">");
            html.AppendLine("                <p><strong>Reviewed By:</strong> {System.Net.WebUtility.HtmlEncode(userName)}</p>");
            html.AppendLine("                <p><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(userEmail)}</p>");
            html.AppendLine("            </div>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <p><strong>Repository:</strong> {System.Net.WebUtility.HtmlEncode(repositoryName)}</p>");
            html.AppendLine("                <p><strong>Rating:</strong> <span class=\"rating\">{rating} ⭐</span></p>");
            if (!string.IsNullOrWhiteSpace(comment))
            {
                html.AppendLine("                <div class=\"comment-box\">");
                html.AppendLine("                    <p><strong>Comment:</strong></p>");
                html.AppendLine("                    <p>{System.Net.WebUtility.HtmlEncode(comment)}</p>");
                html.AppendLine("                </div>");
            }
            html.AppendLine("            </div>");
            html.AppendLine("            <p>You can view and manage all reviews from the admin dashboard.</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{baseUrl}/admin/reviews\" class=\"button\">View All Reviews</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Review ID: <strong>{reviewId}</strong></p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio System</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(userName)}", System.Net.WebUtility.HtmlEncode(userName))
                .Replace("{System.Net.WebUtility.HtmlEncode(userEmail)}", System.Net.WebUtility.HtmlEncode(userEmail))
                .Replace("{System.Net.WebUtility.HtmlEncode(repositoryName)}", System.Net.WebUtility.HtmlEncode(repositoryName))
                .Replace("{rating}", rating.ToString())
                .Replace("{System.Net.WebUtility.HtmlEncode(comment)}", System.Net.WebUtility.HtmlEncode(comment ?? "No comment provided"))
                .Replace("{reviewId}", reviewId.ToString());
        }

        public string GenerateFeedbackNotificationEmail(string fullName, string email, string companyName, string country, string howCanWeHelp, string productServiceInterest, string howDidYouHearAboutUs, string baseUrl, int feedbackId)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine("    <title>New Feedback Received</title>");
            html.AppendLine("    <style>");
            html.AppendLine("        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
            html.AppendLine("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }");
            html.AppendLine("        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
            html.AppendLine("        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }");
            html.AppendLine("        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
            html.AppendLine("        .button:hover { background: #2563eb; }");
            html.AppendLine("        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }");
            html.AppendLine("        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }");
            html.AppendLine("        .detail-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }");
            html.AppendLine("        .detail-label { font-weight: bold; color: #4b5563; }");
            html.AppendLine("        .detail-value { color: #1f2937; margin-top: 5px; }");
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("    <div class=\"container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>📧 New Feedback Received</h1>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"content\">");
            html.AppendLine("            <p>Hello Admin,</p>");
            html.AppendLine("            <p>A new feedback has been submitted through the contact form.</p>");
            html.AppendLine("            <div class=\"info-box\">");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Name:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(fullName)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Email:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(email)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Company:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(companyName)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Country:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(country)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Product/Service Interest:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(productServiceInterest)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">How did they hear about us:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(howDidYouHearAboutUs)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("                <div class=\"detail-row\">");
            html.AppendLine("                    <div class=\"detail-label\">Message:</div>");
            html.AppendLine("                    <div class=\"detail-value\">{System.Net.WebUtility.HtmlEncode(howCanWeHelp)}</div>");
            html.AppendLine("                </div>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>You can view and manage this feedback from the admin dashboard.</p>");
            html.AppendLine("            <div style=\"text-align: center;\">");
            html.AppendLine($"                <a href=\"{baseUrl}/admin/feedbacks\" class=\"button\">View Feedback</a>");
            html.AppendLine("            </div>");
            html.AppendLine("            <p>Feedback ID: <strong>{feedbackId}</strong></p>");
            html.AppendLine("            <p>Best regards,<br>IT Solution Portfolio System</p>");
            html.AppendLine("        </div>");
            html.AppendLine("        <div class=\"footer\">");
            html.AppendLine("            <p>This is an automated email. Please do not reply to this message.</p>");
            html.AppendLine("        </div>");
            html.AppendLine("    </div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString()
                .Replace("{System.Net.WebUtility.HtmlEncode(fullName)}", System.Net.WebUtility.HtmlEncode(fullName))
                .Replace("{System.Net.WebUtility.HtmlEncode(email)}", System.Net.WebUtility.HtmlEncode(email))
                .Replace("{System.Net.WebUtility.HtmlEncode(companyName)}", System.Net.WebUtility.HtmlEncode(companyName))
                .Replace("{System.Net.WebUtility.HtmlEncode(country)}", System.Net.WebUtility.HtmlEncode(country))
                .Replace("{System.Net.WebUtility.HtmlEncode(productServiceInterest)}", System.Net.WebUtility.HtmlEncode(productServiceInterest))
                .Replace("{System.Net.WebUtility.HtmlEncode(howDidYouHearAboutUs)}", System.Net.WebUtility.HtmlEncode(howDidYouHearAboutUs))
                .Replace("{System.Net.WebUtility.HtmlEncode(howCanWeHelp)}", System.Net.WebUtility.HtmlEncode(howCanWeHelp))
                .Replace("{feedbackId}", feedbackId.ToString());
        }
    }
}
