Write-Host "Testing Whisper Service..." -ForegroundColor Yellow

# Test health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -TimeoutSec 10
    Write-Host "   ✅ Health check passed: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test models endpoint
Write-Host "2. Testing models endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/models" -TimeoutSec 10
    Write-Host "   ✅ Models endpoint passed: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Models endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "If both tests pass, the Whisper service is running correctly." -ForegroundColor Green
Write-Host "The 500 error might be due to audio format issues." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue" 