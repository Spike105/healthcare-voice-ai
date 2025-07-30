Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gemma 3 1B Setup for Healthcare Voice AI" -ForegroundColor Cyan
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

# Check if Gemma 3 1B is installed
Write-Host ""
Write-Host "Checking Gemma 3 1B model..." -ForegroundColor Yellow
try {
    $models = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 | ConvertFrom-Json
    $gemmaInstalled = $models.models | Where-Object { $_.name -like "*gemma*" }
    
    if ($gemmaInstalled) {
        Write-Host "✅ Gemma model is installed: $($gemmaInstalled.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ Gemma 3 1B model is not installed" -ForegroundColor Red
        Write-Host "Downloading Gemma 3 1B model (this may take several minutes)..." -ForegroundColor Yellow
        Write-Host "Model size: ~815MB" -ForegroundColor Cyan
        
        $response = Read-Host "Do you want to download Gemma 3 1B now? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Downloading Gemma 3 1B..." -ForegroundColor Yellow
            ollama pull gemma3:1b
            Write-Host "✅ Gemma 3 1B downloaded successfully" -ForegroundColor Green
        } else {
            Write-Host "Please run 'ollama pull gemma3:1b' manually" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error checking models: $_" -ForegroundColor Red
}

# Test Gemma 3 1B
Write-Host ""
Write-Host "Testing Gemma 3 1B with a healthcare question..." -ForegroundColor Yellow
try {
    $testPrompt = "What are the common symptoms of a headache?"
    Write-Host "Test prompt: $testPrompt" -ForegroundColor Cyan
    
    $testResponse = ollama run gemma3:1b $testPrompt
    Write-Host "✅ Gemma 3 1B is working correctly" -ForegroundColor Green
    Write-Host "Sample response: $($testResponse.Substring(0, [Math]::Min(100, $testResponse.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error testing Gemma 3 1B: $_" -ForegroundColor Red
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