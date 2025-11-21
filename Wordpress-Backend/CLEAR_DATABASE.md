# How to Clear/Reset the Database

## Quick Method (Recommended)

### Option 1: Delete the Database File (Easiest)

1. **Stop the backend** (if running)
   - Press `Ctrl+C` in the terminal

2. **Delete the database file:**
   ```powershell
   # PowerShell
   Remove-Item WordpressDb.db
   ```

   Or manually:
   - Navigate to `Wordpress-Backend` folder
   - Delete the file `WordpressDb.db`

3. **Restart the backend:**
   ```bash
   dotnet run
   ```
   - The database will be recreated automatically
   - Super admin will be created automatically

### Option 2: Use the Script

**PowerShell:**
```powershell
cd Wordpress-Backend
.\scripts\clear-database.ps1
```

**Bash (Linux/Mac):**
```bash
cd Wordpress-Backend
chmod +x scripts/clear-database.sh
./scripts/clear-database.sh
```

## Alternative Methods

### Option 3: Clear Data Only (Keep Structure)

If you want to keep the database structure but clear all data, you can use SQL:

1. **Stop the backend**

2. **Open the database** with SQLite browser or command line:
   ```bash
   sqlite3 WordpressDb.db
   ```

3. **Run these SQL commands:**
   ```sql
   -- Delete all users (except keep structure)
   DELETE FROM AspNetUsers;
   DELETE FROM AspNetRoles;
   DELETE FROM AspNetUserRoles;
   DELETE FROM AspNetUserClaims;
   DELETE FROM AspNetRoleClaims;
   DELETE FROM AspNetUserLogins;
   DELETE FROM AspNetUserTokens;
   
   -- Delete other data
   DELETE FROM Products;
   DELETE FROM Domains;
   DELETE FROM Publications;
   DELETE FROM Repositories;
   
   -- Reset auto-increment counters (SQLite)
   DELETE FROM sqlite_sequence WHERE name IN ('Products', 'Domains', 'Publications', 'Repositories');
   ```

4. **Restart the backend** - it will recreate the super admin

### Option 4: Using EF Core Commands

If you have `dotnet ef` installed:

```bash
# Drop the database
dotnet ef database drop --force

# Recreate it
dotnet ef database update
```

Then restart the backend to seed the data.

## What Happens After Clearing?

1. **Database is deleted/recreated**
2. **All tables are recreated** with latest schema
3. **Super admin is automatically created:**
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Role: Admin
4. **Default user is created:**
   - Email: `user@example.com`
   - Password: `User@123`
   - Role: User

## Backup Before Clearing

The script automatically creates a backup as `WordpressDb.backup.db`. You can restore it by:

```powershell
# Restore from backup
Copy-Item WordpressDb.backup.db WordpressDb.db
```

## Important Notes

⚠️ **Warning:** Clearing the database will:
- Delete ALL users
- Delete ALL products
- Delete ALL publications
- Delete ALL repositories
- Delete ALL data

✅ **Safe:** The database structure will be recreated automatically when you restart the backend.

## Quick Commands Reference

```powershell
# Delete database (PowerShell)
Remove-Item WordpressDb.db

# Delete database (Bash)
rm WordpressDb.db

# Create backup (PowerShell)
Copy-Item WordpressDb.db WordpressDb.backup.db

# Create backup (Bash)
cp WordpressDb.db WordpressDb.backup.db
```

