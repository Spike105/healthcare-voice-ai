@echo off
echo ========================================
echo LLM Service Test Runner
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python environment...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python.
    pause
    exit /b 1
)

echo.
echo Running LLM service tests...
echo.

python test_llm.py

echo.
echo Test completed. Press any key to exit...
pause >nul