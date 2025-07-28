Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare Voice AI - Service Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "Frontend"; URL = "http://localhost:3000" },
    @{ Name = "Backend API"; URL = "http://localhost:3001/health" },
    @{ Name = "Whisper STT"; URL = "http://localhost:5001/health" }
)

foreach ($service in $services) {
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✓ RUNNING" -ForegroundColor Green
        } else {
            Write-Host " ✗ ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all services show ✓ RUNNING, your system is ready!" -ForegroundColor Green
Write-Host "If any show ✗ NOT RUNNING, start the services first." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 