Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare Voice AI - Service Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[1/5] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[2/5] Installing LLM service dependencies..." -ForegroundColor Yellow
Set-Location ..\services\llm-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing LLM service dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/5] Setting up Python virtual environments..." -ForegroundColor Yellow

# Whisper service setup
Set-Location ..\whisper-service
if (-not (Test-Path "venv")) {
    Write-Host "Creating Whisper service virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing Whisper service dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# TTS service setup
Set-Location ..\tts-service
if (-not (Test-Path "venv")) {
    Write-Host "Creating TTS service virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing TTS service dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/5] Starting services in background..." -ForegroundColor Yellow
Write-Host ""

$projectRoot = Get-Location

Write-Host "Starting Whisper STT Service (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\whisper-service'; .\venv\Scripts\Activate.ps1; python main.py" -WindowStyle Normal

Write-Host "Starting LLM Service (Port 5002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\llm-service'; npm start" -WindowStyle Normal

Write-Host "Starting TTS Service (Port 5003)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\services\tts-service'; .\venv\Scripts\Activate.ps1; python main.py" -WindowStyle Normal

Write-Host "Starting Backend API Gateway (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "[5/5] Starting Frontend (Port 3000)..." -ForegroundColor Yellow
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
Write-Host "- TTS Service: http://localhost:5003" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait a few moments for all services to start up." -ForegroundColor Yellow
Write-Host "You can check service status at: http://localhost:3001/api/services/status" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 