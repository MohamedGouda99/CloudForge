#requires -Version 5
<#
.SYNOPSIS
    Starts the CloudForge backend (Docker Compose via Ubuntu WSL) and the frontend (Vite dev server) in the background.

.DESCRIPTION
    This script mirrors the manual steps documented in docs/run_in_background.md.
    It launches the backend containers inside Ubuntu WSL and spawns the frontend Vite dev server
    on Windows without blocking the current PowerShell session.

.PARAMETER SkipBackend
    Do not start the backend containers.

.PARAMETER SkipFrontend
    Do not start the frontend dev server.

.EXAMPLE
    .\run_cloudforge_background.ps1

.EXAMPLE
    .\run_cloudforge_background.ps1 -SkipFrontend
#>

[CmdletBinding()]
param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$frontendDir = Join-Path $projectRoot 'frontend'
$composeCmd = 'cd /mnt/c/Users/goda/Downloads/brainboard && docker compose up -d'

function Invoke-WSLCommand {
    param(
        [Parameter(Mandatory)]
        [string]$Command
    )

    Write-Verbose "wsl -d Ubuntu sh -lc `"$Command`""
    & wsl.exe -d Ubuntu sh -lc $Command
    return $LASTEXITCODE
}

if (-not $SkipBackend) {
    Write-Host "[Backend] Starting Docker Compose stack inside Ubuntu WSL..." -ForegroundColor Cyan
    $exitCode = Invoke-WSLCommand -Command $composeCmd
    if ($exitCode -ne 0) {
        throw "Docker Compose failed with exit code $exitCode. Check Docker Desktop/WSL status."
    }

    Write-Host "[Backend] Waiting for health endpoint..." -ForegroundColor Cyan
    $healthUri = 'http://localhost:8000/health'
    $attempts = 0
    $maxAttempts = 20
    $healthy = $false

    while ($attempts -lt $maxAttempts -and -not $healthy) {
        $attempts++
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUri -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                Write-Host "[Backend] Healthy response received (attempt $attempts)." -ForegroundColor Green
                $healthy = $true
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    if (-not $healthy) {
        Write-Warning "[Backend] Health check did not return 200 after $maxAttempts attempts. Check logs with:"
        Write-Warning "           wsl -d Ubuntu sh -lc `"cd /mnt/c/Users/goda/Downloads/brainboard && docker compose logs`""
    }
}

if (-not $SkipFrontend) {
    $existing = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
        Where-Object { $_.State -eq 'Listen' -and $_.OwningProcess -ne 0 }
    if ($existing) {
        $pid = $existing[0].OwningProcess
        $procName = ''
        try {
            $procName = (Get-Process -Id $pid -ErrorAction Stop).ProcessName
        } catch {
            $procName = 'unknown'
        }
        Write-Host "[Frontend] Port 3000 already in use (PID $pid - $procName). Skipping new launch." -ForegroundColor Yellow
    } else {
        Write-Host "[Frontend] Starting Vite dev server on http://localhost:3000 ..." -ForegroundColor Cyan
        $npmArgs = @('run', 'dev', '--', '--host', '0.0.0.0')
        Start-Process -FilePath 'npm' -ArgumentList $npmArgs -WorkingDirectory $frontendDir
        Write-Host "[Frontend] npm run dev launched in background (check with Get-Process node)." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "CloudForge services are starting." -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend health: http://localhost:8000/health"
Write-Host ""
Write-Host "To stop: docker compose down (WSL) and Stop-Process node." -ForegroundColor DarkGray
