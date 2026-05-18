# ============================================================
#  git-watcher.ps1 - Auto-commit al guardar archivos
#  Coloca este archivo en la raiz de tu proyecto Git
# ============================================================

param(
    [string]$Path = $PSScriptRoot,
    [int]$DebounceSeconds = 5
)

function Write-Info  { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err   { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

if (-not (Test-Path "$Path\.git")) {
    Write-Err "No se encontro repositorio Git en: $Path"
    Write-Err "Ejecuta git init primero."
    pause; exit 1
}

Write-Info "==================================================="
Write-Info " Git Watcher - iniciado"
Write-Info " Carpeta : $Path"
Write-Info " Debounce: $DebounceSeconds segundos"
Write-Info "==================================================="
Write-Info "Presiona Ctrl+C para detener."
Write-Host ""

$watcher                       = New-Object System.IO.FileSystemWatcher
$watcher.Path                  = $Path
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents   = $true

$ignoredPatterns = @('.git', 'node_modules', '.vercel', '__pycache__', '.vscode')

$script:pendingCommit  = $false
$script:lastChangeTime = [DateTime]::MinValue
$script:changedFiles   = [System.Collections.Generic.HashSet[string]]::new()

$onChange = {
    param($source, $e)
    foreach ($pattern in $ignoredPatterns) {
        if ($e.FullPath -like "*\$pattern\*") { return }
    }
    if ($e.Name -match '~$|\.tmp$|\.swp$|\.bak$') { return }

    $script:pendingCommit  = $true
    $script:lastChangeTime = [DateTime]::Now
    $null = $script:changedFiles.Add($e.Name)
    Write-Host "  [~] Cambio: $($e.Name)" -ForegroundColor DarkGray
}

Register-ObjectEvent $watcher "Changed" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Created" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $onChange | Out-Null

function Get-CommitMessage {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $files = $script:changedFiles -join ", "
    if ($files.Length -gt 80) {
        $count = $script:changedFiles.Count
        $files = "$count files"
    }
    return "auto: $files [$timestamp]"
}

function Invoke-GitCommit {
    Set-Location $Path
    $status = git status --porcelain 2>&1
    if (-not $status) {
        Write-Warn "Sin cambios en Git, omitiendo commit."
        return
    }
    $message = Get-CommitMessage
    Write-Info "Commiteando: $message"
    git add . 2>&1 | Out-Null
    $result = git commit -m "$message" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "Commit OK -> $message"
    } else {
        Write-Err "Error: $result"
    }
    $script:changedFiles.Clear()
}

try {
    while ($true) {
        Start-Sleep -Milliseconds 500
        if ($script:pendingCommit) {
            $elapsed = ([DateTime]::Now - $script:lastChangeTime).TotalSeconds
            if ($elapsed -ge $DebounceSeconds) {
                $script:pendingCommit = $false
                Invoke-GitCommit
            }
        }
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host ""
    Write-Warn "Watcher detenido."
}
