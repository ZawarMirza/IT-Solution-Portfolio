# Debugging Email Verification Issues

## Current Issue
Token is being received correctly (264 characters, contains +, /, =) but verification is failing with 400 Bad Request.

## Debug Steps

1. **Check Backend Logs** - Look for:
   - "Received verification request. Token length: X"
   - "Found X unverified users"
   - "Unverified user emails: ..."
   - "Token validation failed for user ..."
   - "Successfully verified email for user ..."

2. **Check Frontend Console** - Look for:
   - Token length and sample
   - Error response data
   - Request payload

3. **Common Issues:**
   - Token already used (user already verified)
   - Token expired (check VerificationTokenExpiresAt)
   - No unverified users found
   - Token format mismatch

## Token Format
- ASP.NET Identity tokens are base64-encoded
- Contain special characters: `+`, `/`, `=`
- Length: ~264 characters
- React Router auto-decodes query parameters

## Next Steps
1. Check backend terminal logs when clicking verification link
2. Verify there are unverified users in database
3. Check if token matches what was generated during registration

