# PowerShell script to start all services
Write-Host "Starting Healthcare Voice AI Services..." -ForegroundColor Green

# Start STT Service
Write-Host "Starting STT Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\Hp\Desktop\Solix\healthcare-voice-ai\services\stt-service'; python stt_service.py; Read-Host 'Press Enter to close'"

Start-Sleep 2

# Start TTS Service
Write-Host "Starting TTS Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\Hp\Desktop\Solix\healthcare-voice-ai\services\tts-service'; python tts_service.py; Read-Host 'Press Enter to close'"

Start-Sleep 2

# Start LLM Service
Write-Host "Starting LLM Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\Hp\Desktop\Solix\healthcare-voice-ai\services\llm-service'; npm start; Read-Host 'Press Enter to close'"

Start-Sleep 2

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\Hp\Desktop\Solix\healthcare-voice-ai\backend'; npm start; Read-Host 'Press Enter to close'"

Start-Sleep 2

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\Hp\Desktop\Solix\healthcare-voice-ai\frontend'; npm run dev; Read-Host 'Press Enter to close'"

Write-Host "All services started in separate windows!" -ForegroundColor Green
Write-Host "Services running on:" -ForegroundColor Cyan
Write-Host "- STT Service: http://localhost:5001" -ForegroundColor White
Write-Host "- TTS Service: http://localhost:5013" -ForegroundColor White
Write-Host "- LLM Service: http://localhost:5002" -ForegroundColor White
Write-Host "- Backend: http://localhost:3001" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
