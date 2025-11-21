# How to Check Backend Logs for Verification Issues

## When Verification Fails

When you click the verification link and get an error, **check the backend terminal** for detailed logs.

## What to Look For

1. **Token Received:**
   ```
   Received verification request. Token length: 264, Token starts with: CfDJ8MzP2AOHC3NHrXeYZCRdfr...
   ```

2. **Token Hash Matching:**
   ```
   Looking for user with token hash: [hash]
   Found user eshaarif0322@gmail.com by token hash
   ```

3. **Verification Attempt:**
   ```
   Attempting to verify user eshaarif0322@gmail.com with token (length: 264)
   ```

4. **Success or Failure:**
   - Success: `✓ Successfully verified email for user eshaarif0322@gmail.com`
   - Failure: `Token validation failed for user eshaarif0322@gmail.com: [error details]`

5. **If Hash Matching Fails:**
   ```
   Token hash matching failed, trying all unverified users
   Found X unverified users
   Unverified user emails: eshaarif0322@gmail.com
   ```

6. **Final Error:**
   ```
   Verification failed: Invalid token or token already used
   Database state: X unverified users, Y verified users
   Users with stored token hashes: Z
   ```

## Common Issues

1. **No user found by hash:**
   - Token hash doesn't match any stored hash
   - User might not exist
   - Token might have been modified

2. **User found but verification fails:**
   - Token format issue
   - User's security stamp changed
   - Token already used

3. **No unverified users:**
   - User already verified
   - User doesn't exist

## Next Steps

1. **Copy the backend logs** when you click the verification link
2. **Share the logs** so we can see exactly what's happening
3. **Check if the user exists** in the database
4. **Verify the token hash** matches what was stored during registration

