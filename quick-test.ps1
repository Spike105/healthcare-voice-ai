Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare Voice AI - Quick Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "Frontend"; URL = "http://localhost:3000" },
    @{ Name = "Backend API"; URL = "http://localhost:3001/health" },
    @{ Name = "Whisper STT"; URL = "http://localhost:5001/health" }
)

$allRunning = $true

foreach ($service in $services) {
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✓ RUNNING" -ForegroundColor Green
        } else {
            Write-Host " ✗ ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
            $allRunning = $false
        }
    } catch {
        Write-Host " ✗ NOT RUNNING" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "✅ ALL SERVICES ARE RUNNING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your Healthcare Voice AI is ready!" -ForegroundColor Green
    Write-Host "🌐 Open your browser and go to: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 How to test:" -ForegroundColor White
    Write-Host "1. Click 'Start Recording' and speak something" -ForegroundColor White
    Write-Host "2. Wait for transcription (should be fast now!)" -ForegroundColor White
    Write-Host "3. View the transcribed text" -ForegroundColor White
} else {
    Write-Host "❌ Some services are not running" -ForegroundColor Red
    Write-Host "Please start the services first" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
