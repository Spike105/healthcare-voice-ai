Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare Voice AI - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

$projectRoot = Get-Location

Write-Host "Starting Whisper STT Service (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\whisper-service'; .\venv\Scripts\Activate.ps1; python main.py" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting LLM Service (Port 5002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\llm-service'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting Backend API Gateway (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All services are starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "- Backend API: http://localhost:3001" -ForegroundColor Green
Write-Host "- Whisper STT: http://localhost:5001" -ForegroundColor Green
Write-Host "- LLM Service: http://localhost:5002" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait a few moments for all services to start up." -ForegroundColor Yellow
Write-Host "You can check service status at: http://localhost:3001/api/services/status" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 