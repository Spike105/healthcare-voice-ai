Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare Voice AI - Service Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "Frontend"; URL = "http://localhost:3000" },
    @{ Name = "Backend API"; URL = "http://localhost:3001/health" },
    @{ Name = "Whisper STT"; URL = "http://localhost:5001/health" },
    @{ Name = "LLM Service"; URL = "http://localhost:5002/health" }
)

$allRunning = $true

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK] RUNNING" -ForegroundColor Green
        } else {
            Write-Host " [ERR] ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
            $allRunning = $false
        }
    } catch {
        Write-Host " [ERR] NOT RUNNING" -ForegroundColor Red
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
} else {
    Write-Host "❌ Some services are not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start all services, run:" -ForegroundColor Yellow
    Write-Host ".\start-all-services.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start services manually:" -ForegroundColor Yellow
    Write-Host "1. LLM Service: cd services/llm-service && npm start" -ForegroundColor White
    Write-Host "2. Whisper Service: cd services/whisper-service && python main.py" -ForegroundColor White
    Write-Host "3. Backend: cd backend && npm start" -ForegroundColor White
    Write-Host "4. Frontend: cd frontend && npm run dev" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit" 