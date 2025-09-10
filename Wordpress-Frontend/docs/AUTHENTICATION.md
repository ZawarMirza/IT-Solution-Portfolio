# Authentication System Documentation

This document outlines the authentication system implemented in the application, including features like JWT authentication, session management, and role-based access control.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Different access levels for different user roles
- **Session Management**: Automatic token refresh and session timeout
- **Password Reset**: Secure password reset flow with email verification
- **Email Verification**: Required for new user registration
- **Protected Routes**: Route protection based on authentication status and user roles

## Authentication Flow

### 1. User Registration

1. User fills out the registration form with required details
2. System validates the input and creates a new user account
3. An email verification link is sent to the user's email
4. User clicks the verification link to activate their account

### 2. User Login

1. User provides email and password
2. System validates credentials and issues JWT tokens
3. Access token is stored in memory
4. Refresh token is stored in HTTP-only cookie
5. User is redirected to the appropriate dashboard based on role

### 3. Token Refresh

1. Access token expires after 15 minutes
2. Refresh token is valid for 7 days
3. Automatic token refresh happens when:
   - Access token is about to expire (within 5 minutes)
   - 401 Unauthorized response is received

### 4. Session Management

- **Session Timeout**: 15 minutes of inactivity
- **Warning**: User sees a warning 2 minutes before session expires
- **Automatic Logout**: After 15 minutes of inactivity
- **Activity Tracking**: Any user activity (mouse movement, clicks, keypresses) resets the timeout

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user (invalidate tokens)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address

## User Roles

- **Admin**: Full access to all features
- **User**: Standard user access
- **Guest**: Limited access (not logged in)

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5119/api
REACT_APP_TOKEN_REFRESH_INTERVAL=600000  # 10 minutes
REACT_APP_SESSION_TIMEOUT=900000         # 15 minutes
REACT_APP_REFRESH_THRESHOLD=300000       # 5 minutes
REACT_APP_WARNING_THRESHOLD=120000       # 2 minutes
```

## Security Considerations

1. **JWT Security**:
   - Access tokens have short expiration (15 minutes)
   - Refresh tokens are stored in HTTP-only cookies
   - Tokens are signed with a strong secret key

2. **Password Security**:
   - Passwords are hashed using bcrypt
   - Minimum password requirements enforced
   - Password strength meter for user feedback

3. **Rate Limiting**:
   - Login attempts are rate-limited
   - Password reset requests are rate-limited

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Testing

Run the test suite with:

```bash
npm test
```

Test coverage includes:
- User registration
- Login/logout flow
- Token refresh
- Protected routes
- Role-based access control

## Troubleshooting

### Common Issues

1. **Token Expiration**:
   - If you get a 401 error, the access token may have expired
   - The app should automatically refresh the token
   - If refresh fails, user will be logged out

2. **Session Timeout**:
   - After 15 minutes of inactivity, the session will expire
   - User will be redirected to login page

3. **Email Verification**:
   - Check spam folder for verification emails
   - Click the verification link within 24 hours

## Future Improvements

1. Implement multi-factor authentication (MFA)
2. Add social login (Google, Facebook, etc.)
3. Implement account lockout after failed attempts
4. Add audit logging for security events
5. Implement device management and session revocation
