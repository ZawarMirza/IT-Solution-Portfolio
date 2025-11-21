# Fix Database Columns Issue

## Problem
The database is missing the new verification token columns, causing errors when trying to create the super admin.

## Solution

I've updated `Program.cs` to automatically add the missing columns when the backend starts. 

### Steps to Fix:

1. **Stop the backend** (if it's running)
   - Press `Ctrl+C` in the terminal where the backend is running
   - Or close the terminal

2. **Restart the backend:**
   ```bash
   cd Wordpress-Backend
   dotnet run
   ```

3. The backend will now:
   - Automatically check if the columns exist
   - Add them if they're missing
   - Create the super admin

### Alternative: Manual SQL Fix

If you prefer to manually add the columns, you can use SQLite:

1. Open the database file: `WordpressDb.db` (in the Wordpress-Backend folder)
2. Run these SQL commands:
   ```sql
   ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenHash TEXT;
   ALTER TABLE AspNetUsers ADD COLUMN VerificationTokenExpiresAt TEXT;
   ALTER TABLE AspNetUsers ADD COLUMN EmailVerifiedAt TEXT;
   ALTER TABLE AspNetUsers ADD COLUMN LastVerificationEmailSentAt TEXT;
   ```

3. Restart the backend

### Verify It Works

After restarting, check the logs. You should see:
- Database initialization successful
- Super admin created (or already exists)

Then test the super admin login:
- Email: `admin@example.com`
- Password: `Admin@123`

