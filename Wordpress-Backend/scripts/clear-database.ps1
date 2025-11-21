# PowerShell script to clear/reset the database
# Usage: .\scripts\clear-database.ps1

$dbPath = "WordpressDb.db"
$dbBackupPath = "WordpressDb.backup.db"

Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Database Reset Script" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $dbPath) {
    Write-Host "Found database: $dbPath" -ForegroundColor Cyan
    
    # Ask for confirmation
    $response = Read-Host "Do you want to DELETE the database? This will remove ALL data! (yes/no)"
    
    if ($response -eq "yes" -or $response -eq "y") {
        # Create backup first
        Write-Host "Creating backup..." -ForegroundColor Yellow
        Copy-Item $dbPath $dbBackupPath -ErrorAction SilentlyContinue
        
        # Delete the database
        Write-Host "Deleting database..." -ForegroundColor Red
        Remove-Item $dbPath -Force
        
        Write-Host "✓ Database deleted successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Backup saved as: $dbBackupPath" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Restart the backend (dotnet run)" -ForegroundColor White
        Write-Host "2. The database will be recreated automatically" -ForegroundColor White
        Write-Host "3. Super admin will be created automatically" -ForegroundColor White
    } else {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
    }
} else {
    Write-Host "Database file not found: $dbPath" -ForegroundColor Red
    Write-Host "The database will be created when you start the backend." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow

