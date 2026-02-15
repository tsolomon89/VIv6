
# 1. Clean Ports
$ports = @(3333, 5173) + (3000..3010)
Write-Host "Cleaning ports: $ports" -ForegroundColor Cyan

foreach ($port in $ports) {
    if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
        $conns = Get-NetTCPConnection -LocalPort $port
        foreach ($conn in $conns) {
            $pid_to_kill = $conn.OwningProcess
            if ($pid_to_kill -gt 0) {
                Write-Host "Killing PID $pid_to_kill on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# 2. Clean Vite Cache
$viteCache = "src/ui/node_modules/.vite"
if (Test-Path $viteCache) {
    Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
    Remove-Item -Path $viteCache -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Start API (Port 3333)
Write-Host "Starting API (Port 3333)..." -ForegroundColor Green
$env:API_PORT = 3333
# Using Start-Process to run in a new window/background so it doesn't block
$apiProcess = Start-Process -FilePath "cmd" -ArgumentList "/c npx tsx src/api/server.ts" -PassThru
Write-Host "API Process ID: $($apiProcess.Id)"

# Wait for health
Write-Host "Waiting for API health..."
$retries = 30
while ($retries -gt 0) {
    try {
        $resp = Invoke-WebRequest "http://localhost:3333/api/health" -UseBasicParsing -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            Write-Host "API is Healthy!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
        $retries--
    }
}

if ($retries -eq 0) {
    Write-Host "`nAPI failed to start or is not reachable!" -ForegroundColor Red
    # Don't exit, maybe UI can still start for debugging
}

# 4. Start UI
Write-Host "`nStarting UI (Port 5173)..." -ForegroundColor Green
Set-Location "src/ui"
# Start UI in a new window
Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev -- --port 5173"
Set-Location "../.."

Write-Host "Environment Started!" -ForegroundColor Cyan
Write-Host "API: http://localhost:3333"
Write-Host "UI:  http://localhost:5173"
