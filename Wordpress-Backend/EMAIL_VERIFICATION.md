# Email Verification System

## Overview
The email verification system ensures that users verify their email addresses before they can log in to the application.

## Features

### Registration Flow
1. User registers with email and password
2. System generates a verification token (hashed and stored in database)
3. Verification email is sent to user's email address
4. User must verify email before logging in
5. **No auto-login after registration** - user must verify email first

### Email Verification
- Tokens are hashed using SHA256 before storage
- Tokens expire after 24 hours
- Verification link format: `http://localhost:3000/verify-email/{encoded-token}`
- Users can resend verification emails if needed

### Login Flow
- Users with unverified emails (except Admin) cannot log in
- Login will return an error message prompting email verification
- Admin users bypass email verification requirement

## Configuration

### Email Settings (appsettings.json)
```json
{
  "EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "UseSsl": true,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "noreply@itsolutionportfolio.com",
    "FromName": "IT Solution Portfolio"
  },
  "FrontendUrl": "http://localhost:3000"
}
```

### Gmail Setup
For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in the `Password` field

## API Endpoints

### POST /api/auth/register
Registers a new user and sends verification email.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "role": "User"
}
```

**Response:**
```json
{
  "message": "Registration successful! Please check your email to verify your account before logging in.",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

### POST /api/auth/verify-email
Verifies user's email address using the token from the verification link.

**Request:**
```json
{
  "token": "encoded-verification-token"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### GET /api/auth/verify-email/{token}
Alternative endpoint for email verification via GET request (redirects to frontend).

### POST /api/auth/resend-verification
Resends verification email to the user.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email has been sent. Please check your inbox."
}
```

### POST /api/auth/login
Login endpoint that checks email verification status.

**Response (if email not verified):**
```json
{
  "message": "Please verify your email address before logging in. Check your inbox for the verification link.",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

## Database Schema

The `ApplicationUser` table includes:
- `VerificationTokenHash` (string, nullable) - SHA256 hash of the verification token
- `VerificationTokenExpiry` (DateTime, nullable) - Token expiration timestamp
- `EmailConfirmed` (bool) - Whether email is verified

## Super Admin Credentials

When you run the application, a super admin user is automatically created:

- **Email:** `admin@example.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Email Verified:** Yes (bypasses verification requirement)

**IMPORTANT:** Change this password in production!

## Email Templates

Email templates are generated using `EmailTemplateService`:
- `GenerateVerificationEmail()` - Initial verification email
- `GenerateResendVerificationEmail()` - Resend verification email

Templates include:
- Professional HTML design
- Verification button
- Plain text link alternative
- Expiration notice (24 hours)
- Branding

## Frontend Integration

The frontend handles email verification through:
- `EmailVerificationPage` - Displays verification status
- `AuthContext` - Manages verification state
- `SignupPage` - Redirects to login after registration
- `LoginPage` - Shows verification error if needed

## Testing

### Development Mode
In development, if email sending fails, the registration will still succeed but the verification email won't be sent. Check the logs for the verification token.

### Production Mode
Ensure SMTP settings are correctly configured. Failed email sends will be logged but won't prevent user registration.

## Security Considerations

1. **Token Hashing:** Tokens are hashed before storage
2. **Token Expiry:** Tokens expire after 24 hours
3. **One-Time Use:** Tokens should be cleared after successful verification
4. **Admin Bypass:** Admin users bypass email verification (created via DbInitializer)
5. **Rate Limiting:** Consider adding rate limiting for resend verification endpoint

## Troubleshooting

### Email Not Received
1. Check spam folder
2. Verify SMTP settings in appsettings.json
3. Check application logs for errors
4. Verify email address is correct
5. Use resend verification endpoint

### Token Expired
1. Use resend verification endpoint to get a new token
2. New tokens are valid for 24 hours

### Login Fails After Verification
1. Ensure email is confirmed in database
2. Check that `EmailConfirmed` field is `true`
3. Try logging in again

