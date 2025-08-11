# MedAlpaca LLM Service Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedAlpaca LLM Service - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Ollama is running
Write-Host "Checking Ollama service..." -ForegroundColor Yellow
try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    Write-Host "✅ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama is not running. Please start Ollama first:" -ForegroundColor Red
    Write-Host "   ollama serve" -ForegroundColor Yellow
    exit 1
}

# Check if MedAlpaca model is available
Write-Host "Checking MedAlpaca model..." -ForegroundColor Yellow
try {
    $models = $ollamaResponse.Content | ConvertFrom-Json
    $medalpacaAvailable = $models.models | Where-Object { $_.name -eq "medllama2:7b" }
    if ($medalpacaAvailable) {
        Write-Host "✅ MedAlpaca model (medllama2:7b) is available" -ForegroundColor Green
    } else {
        Write-Host "❌ MedAlpaca model not found. Available models:" -ForegroundColor Red
        $models.models | ForEach-Object { Write-Host "   - $($_.name)" -ForegroundColor Yellow }
        Write-Host "To download MedAlpaca: ollama pull medllama2:7b" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error checking models" -ForegroundColor Red
    exit 1
}

# Start MedAlpaca LLM Service
Write-Host "Starting MedAlpaca LLM Service..." -ForegroundColor Yellow
Set-Location "services/llm-service"
Start-Process -FilePath "node" -ArgumentList "medalpaca-service.js" -WindowStyle Normal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedAlpaca LLM Service is starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service will be available at:" -ForegroundColor White
Write-Host "- MedAlpaca LLM Service: http://localhost:5002" -ForegroundColor Cyan
Write-Host "- Health check: http://localhost:5002/health" -ForegroundColor Cyan
Write-Host "- Chat endpoint: http://localhost:5002/chat" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Press Enter to exit..." -ForegroundColor Yellow
Read-Host 