# Verification Debug Steps

## Current Issue
- Error: "Checked 2 token variations against 1 unverified users"
- Frontend shows: "Invalid link"
- Backend shows: User exists but token doesn't match

## What to Check in Backend Logs

When you click the verification link, check the backend terminal for:

1. **Token Received:**
   ```
   Received verification request. Token length: 264, Token starts with: ...
   ```

2. **All Users:**
   ```
   Total users in database: X
   User: [email], EmailConfirmed: False, HasTokenHash: True
   ```

3. **Hash Matching:**
   ```
   Looking for user with token hash: [hash] (first 20 chars)
   Found user [email] by token hash, EmailConfirmed: False
   ```

4. **Token Validation:**
   ```
   Attempting to verify user [email] with token (length: 264)
   Token validation failed for user [email]: [error message]
   ```

5. **Hash Comparison:**
   ```
   Stored token hash: [hash] (first 20), Computed hash: [hash] (first 20)
   ```

## Common Issues

1. **Hash Mismatch:**
   - Stored hash doesn't match computed hash
   - Token was modified during transmission
   - Token encoding/decoding issue

2. **Security Stamp Changed:**
   - ASP.NET Identity tokens are tied to SecurityStamp
   - If SecurityStamp changed, token becomes invalid
   - Check: "User SecurityStamp: [stamp]"

3. **Token Already Used:**
   - Token was used but hash wasn't cleared
   - User might be verified but hash still exists

## Next Steps

1. **Restart backend** with new logging
2. **Register a new user** (clear DB first)
3. **Click verification link**
4. **Copy ALL backend logs** from registration to verification
5. **Share the logs** so we can see:
   - What hash was stored during registration
   - What hash is computed during verification
   - What error ConfirmEmailAsync returns
   - SecurityStamp values

