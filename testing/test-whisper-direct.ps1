Write-Host "Testing Whisper Transcription Endpoint..." -ForegroundColor Yellow

# Test health endpoint first
Write-Host "1. Testing health endpoint..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing
    Write-Host "   ✅ Health check passed: $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test models endpoint
Write-Host "2. Testing models endpoint..." -ForegroundColor Cyan
try {
    $modelsResponse = Invoke-WebRequest -Uri "http://localhost:5001/models" -UseBasicParsing
    Write-Host "   ✅ Models endpoint passed: $($modelsResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Models endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test transcribe endpoint (this will fail without a file, but we can check if the endpoint exists)
Write-Host "3. Testing transcribe endpoint..." -ForegroundColor Cyan
try {
    $transcribeResponse = Invoke-WebRequest -Uri "http://localhost:5001/transcribe" -Method POST -UseBasicParsing
    Write-Host "   ✅ Transcribe endpoint exists" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "   ✅ Transcribe endpoint exists (expected 422 for missing file)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Transcribe endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Whisper service test completed!" -ForegroundColor Green
Write-Host "If all tests pass, the Whisper service is working correctly." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue" 