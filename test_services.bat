@echo off
echo Testing all services...

echo.
echo Testing STT Service...
cd services\stt-service
start "STT Service" cmd /k "python stt_service.py"
timeout /t 3

echo.
echo Testing TTS Service...
cd ..\tts-service
start "TTS Service" cmd /k "python tts_service.py"
timeout /t 3

echo.
echo Testing LLM Service...
cd ..\llm-service
start "LLM Service" cmd /k "node app.js"
timeout /t 3

echo.
echo Testing Backend...
cd ..\..\backend
start "Backend" cmd /k "node server.js"

echo.
echo All services started in separate windows!
echo Check each window for any errors.
pause
