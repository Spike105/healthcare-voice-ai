@echo off
echo ========================================
echo Healthcare Voice AI - Service Starter
echo ========================================
echo.

echo Starting all services...
echo.

echo [1/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo [2/5] Installing LLM service dependencies...
cd ..\services\llm-service
call npm install
if %errorlevel% neq 0 (
    echo Error installing LLM service dependencies
    pause
    exit /b 1
)

echo [3/5] Setting up Python virtual environments...
cd ..\whisper-service
if not exist venv (
    echo Creating Whisper service virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing Whisper service dependencies
    pause
    exit /b 1
)

cd ..\tts-service
if not exist venv (
    echo Creating TTS service virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing TTS service dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Starting services in background...
echo.

echo Starting Whisper STT Service (Port 5001)...
start "Whisper STT Service" cmd /k "cd /d %cd%\services\whisper-service && venv\Scripts\activate && python main.py"

echo Starting LLM Service (Port 5002)...
start "LLM Service" cmd /k "cd /d %cd%\services\llm-service && npm start"

echo Starting TTS Service (Port 5003)...
start "TTS Service" cmd /k "cd /d %cd%\services\tts-service && venv\Scripts\activate && python main.py"

echo Starting Backend API Gateway (Port 3001)...
start "Backend API Gateway" cmd /k "cd /d %cd%\backend && npm start"

echo.
echo [5/5] Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd /d %cd%\frontend && npm run dev"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Services will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Whisper STT: http://localhost:5001
echo - LLM Service: http://localhost:5002
echo - TTS Service: http://localhost:5003
echo.
echo Please wait a few moments for all services to start up.
echo You can check service status at: http://localhost:3001/api/services/status
echo.
pause 