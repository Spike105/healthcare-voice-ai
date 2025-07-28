Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Healthcare Voice AI Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location

Write-Host "Starting Whisper Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\whisper-service'; .\venv\Scripts\Activate.ps1; python simple_service.py" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Backend API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Green
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
Write-Host ""
Write-Host "Wait a few moments, then open: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 