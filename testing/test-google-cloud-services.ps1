# Test Google Cloud STT and TTS Services
# This script tests the Google Cloud services to ensure they're working correctly

Write-Host "=== Testing Google Cloud STT and TTS Services ===" -ForegroundColor Green
Write-Host ""

# Test STT Service
Write-Host "Testing Google Cloud STT Service..." -ForegroundColor Cyan
try {
    $sttHealth = Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET -TimeoutSec 10
    Write-Host "✓ STT Service Health: $($sttHealth.status)" -ForegroundColor Green
    Write-Host "  Service: $($sttHealth.service)" -ForegroundColor White
    
    # Test models endpoint
    $sttModels = Invoke-RestMethod -Uri "http://localhost:5001/models" -Method GET -TimeoutSec 10
    Write-Host "✓ STT Models Available: $($sttModels.available_models.Count) models" -ForegroundColor Green
    
    # Test setup endpoint
    $sttSetup = Invoke-RestMethod -Uri "http://localhost:5001/setup" -Method GET -TimeoutSec 10
    Write-Host "✓ STT Setup Info: $($sttSetup.setup_required)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ STT Service Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test TTS Service
Write-Host "Testing Google Cloud TTS Service..." -ForegroundColor Cyan
try {
    $ttsHealth = Invoke-RestMethod -Uri "http://localhost:5003/health" -Method GET -TimeoutSec 10
    Write-Host "✓ TTS Service Health: $($ttsHealth.status)" -ForegroundColor Green
    Write-Host "  Service: $($ttsHealth.service)" -ForegroundColor White
    
    # Test voices endpoint
    $ttsVoices = Invoke-RestMethod -Uri "http://localhost:5003/voices" -Method GET -TimeoutSec 10
    if ($ttsVoices.success) {
        Write-Host "✓ TTS Voices Available: $($ttsVoices.total_voices) voices" -ForegroundColor Green
    } else {
        Write-Host "⚠ TTS Voices Error: $($ttsVoices.error)" -ForegroundColor Yellow
    }
    
    # Test languages endpoint
    $ttsLanguages = Invoke-RestMethod -Uri "http://localhost:5003/languages" -Method GET -TimeoutSec 10
    Write-Host "✓ TTS Languages Available: $($ttsLanguages.languages.Count) languages" -ForegroundColor Green
    
    # Test formats endpoint
    $ttsFormats = Invoke-RestMethod -Uri "http://localhost:5003/formats" -Method GET -TimeoutSec 10
    Write-Host "✓ TTS Formats Available: $($ttsFormats.formats.Count) formats" -ForegroundColor Green
    
    # Test setup endpoint
    $ttsSetup = Invoke-RestMethod -Uri "http://localhost:5003/setup" -Method GET -TimeoutSec 10
    Write-Host "✓ TTS Setup Info: $($ttsSetup.setup_required)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ TTS Service Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test TTS with actual text-to-speech
Write-Host "Testing TTS with sample text..." -ForegroundColor Cyan
try {
    $ttsRequest = @{
        text = "Hello, this is a test of the Google Cloud Text-to-Speech service."
        voice = "en-US-Standard-A"
        language = "en-US"
        gender = "NEUTRAL"
        audio_format = "MP3"
    }
    
    $ttsResponse = Invoke-RestMethod -Uri "http://localhost:5003/speak" -Method POST -Body ($ttsRequest | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
    Write-Host "✓ TTS Text-to-Speech Test: Success" -ForegroundColor Green
    Write-Host "  Audio file generated successfully" -ForegroundColor White
    
} catch {
    Write-Host "✗ TTS Text-to-Speech Test Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Green
Write-Host "If you see green checkmarks above, your Google Cloud services are working correctly!" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend and backend services" -ForegroundColor White
Write-Host "2. Test the complete voice AI workflow" -ForegroundColor White
Write-Host "3. Monitor your Google Cloud usage and costs" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 