Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Whisper Service Quick Test" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$whisperUrl = "http://localhost:5001/health"
$transcribeUrl = "http://localhost:5001/transcribe"
$sampleFile = "harvard.wav"  # Use harvard.wav as the sample audio file

Write-Host "Testing Whisper Service health..." -ForegroundColor Yellow -NoNewline

try {
    $response = Invoke-WebRequest -Uri $whisperUrl -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " [OK] RUNNING" -ForegroundColor Green
    } else {
        Write-Host " [ERR] ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERR] NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

if (Test-Path $sampleFile) {
    Write-Host "Uploading sample audio ($sampleFile) for transcription..." -ForegroundColor Yellow
    try {
        Add-Type -AssemblyName System.Net.Http
        $client = New-Object System.Net.Http.HttpClient
        $content = New-Object System.Net.Http.MultipartFormDataContent
        $fileStream = [System.IO.File]::OpenRead($sampleFile)
        $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
        $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("audio/wav")
        $content.Add($fileContent, "file", $sampleFile)

        $response = $client.PostAsync($transcribeUrl, $content).Result
        $result = $response.Content.ReadAsStringAsync().Result
        if ($response.IsSuccessStatusCode) {
            $json = $result | ConvertFrom-Json
            if ($json.success) {
                Write-Host "Transcription: $($json.transcription)" -ForegroundColor Green
                Write-Host "Language: $($json.language)" -ForegroundColor Cyan
                Write-Host "Duration: $($json.duration) seconds" -ForegroundColor Cyan
            } else {
                Write-Host "Transcription failed: $($json)" -ForegroundColor Red
            }
        } else {
            Write-Host "Transcription request failed: $result" -ForegroundColor Red
        }
        $fileStream.Close()
        $client.Dispose()
    } catch {
        Write-Host "Error during transcription: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Sample audio file '$sampleFile' not found. Please add it to the project root." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit" 