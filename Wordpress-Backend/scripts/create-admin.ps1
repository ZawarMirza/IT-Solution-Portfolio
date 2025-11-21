# PowerShell script to create super admin
# Usage: .\scripts\create-admin.ps1

$apiUrl = "http://localhost:5119/api/auth/populate-admin"

Write-Host "Creating Super Admin..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json"
    
    Write-Host "✓ Super Admin Created Successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: $($response.credentials.email)" -ForegroundColor White
    Write-Host "  Password: $($response.credentials.password)" -ForegroundColor White
    Write-Host "  Role: $($response.credentials.role)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Change this password in production!" -ForegroundColor Red
}
catch {
    Write-Host "✗ Error creating super admin:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend is running on http://localhost:5119" -ForegroundColor Yellow
}

