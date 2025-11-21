# Quick Database Clear Commands

## One-Line Command (PowerShell)

```powershell
Get-Process | Where-Object {$_.ProcessName -like "*Wordpress*"} | Stop-Process -Force; Remove-Item WordpressDb.db, WordpressDb.db-shm, WordpressDb.db-wal -ErrorAction SilentlyContinue; Write-Host "✓ Database cleared! Restart backend with 'dotnet run'" -ForegroundColor Green
```

## Step-by-Step Commands

### 1. Stop Backend (if running)
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*Wordpress*"} | Stop-Process -Force
```

### 2. Delete Database Files
```powershell
Remove-Item WordpressDb.db, WordpressDb.db-shm, WordpressDb.db-wal -ErrorAction SilentlyContinue
```

### 3. Restart Backend
```bash
dotnet run
```

## Using the Script

You can also use the script I created:

```powershell
.\scripts\clear-database.ps1
```

## What Happens After Clearing

1. ✅ Database is deleted
2. ✅ On restart, database is recreated automatically
3. ✅ Super admin is created automatically
4. ✅ You can register with the same email again

## Quick Test Flow

1. Clear database (use command above)
2. Restart backend: `dotnet run`
3. Register new user with your email
4. Check email for verification link
5. Click link to verify
6. Test login

## Note

After clearing, you'll need to:
- Restart the backend to recreate the database
- Super admin will be recreated automatically
- All previous users will be removed

