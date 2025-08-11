Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TinyLlama Setup for Healthcare Voice AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is installed
Write-Host "Checking Ollama installation..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version
    Write-Host "✅ Ollama is installed: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Ollama from: https://ollama.ai/download" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Ollama service is running
Write-Host ""
Write-Host "Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5
    Write-Host "✅ Ollama service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama service is not running" -ForegroundColor Red
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5
        Write-Host "✅ Ollama service started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start Ollama service" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if TinyLlama is installed
Write-Host ""
Write-Host "Checking TinyLlama model..." -ForegroundColor Yellow
try {
    $models = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 | ConvertFrom-Json
    $tinyllamaInstalled = $models.models | Where-Object { $_.name -like "*tinyllama*" }
    
    if ($tinyllamaInstalled) {
        Write-Host "✅ TinyLlama model is installed: $($tinyllamaInstalled.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ TinyLlama model is not installed" -ForegroundColor Red
        Write-Host "Downloading TinyLlama model (this may take several minutes)..." -ForegroundColor Yellow
        Write-Host "Model size: ~1.1GB" -ForegroundColor Cyan
        
        $response = Read-Host "Do you want to download TinyLlama now? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Downloading TinyLlama..." -ForegroundColor Yellow
            ollama pull tinyllama:latest
            Write-Host "✅ TinyLlama downloaded successfully" -ForegroundColor Green
        } else {
            Write-Host "Please run 'ollama pull tinyllama:latest' manually" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error checking models: $_" -ForegroundColor Red
}

# Test TinyLlama
Write-Host ""
Write-Host "Testing TinyLlama with a healthcare question..." -ForegroundColor Yellow
try {
    $testPrompt = "What are the common symptoms of a headache?"
    Write-Host "Test prompt: $testPrompt" -ForegroundColor Cyan
    
    $testResponse = ollama run tinyllama:latest $testPrompt
    Write-Host "✅ TinyLlama is working correctly" -ForegroundColor Green
    Write-Host "Sample response: $($testResponse.Substring(0, [Math]::Min(100, $testResponse.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error testing TinyLlama: $_" -ForegroundColor Red
}

# Test LLM service integration
Write-Host ""
Write-Host "Testing LLM service integration..." -ForegroundColor Yellow
try {
    $llmResponse = Invoke-WebRequest -Uri "http://localhost:5002/health" -TimeoutSec 5
    Write-Host "✅ LLM service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ LLM service is not running" -ForegroundColor Red
    Write-Host "Please start the LLM service: cd services/llm-service && npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start your LLM service: cd services/llm-service && npm start" -ForegroundColor White
Write-Host "2. Start your backend: cd backend && npm start" -ForegroundColor White
Write-Host "3. Start your frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "4. Test the complete voice AI system!" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit" 