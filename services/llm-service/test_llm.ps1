# LLM Service Test Runner (PowerShell)
# Tests the healthcare LLM service functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LLM Service Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check Python
Write-Host "Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Python not found. Please install Python." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Running LLM service tests..." -ForegroundColor Yellow
Write-Host ""

# Run the test
try {
    python test_llm.py
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "🎉 All tests completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error running tests: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed. Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")