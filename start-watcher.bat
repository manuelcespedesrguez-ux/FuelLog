@echo off
:: ============================================================
::  start-watcher.bat — Arranca el git-watcher en segundo plano
::  Coloca este .bat en la misma carpeta que git-watcher.ps1
:: ============================================================

echo.
echo  ======================================
echo   FuelLog Git Watcher — Arrancando...
echo  ======================================
echo.

:: Verificar que existe el script
if not exist "%~dp0git-watcher.ps1" (
    echo [ERROR] No se encuentra git-watcher.ps1 en esta carpeta.
    echo Asegurate de que ambos archivos esten juntos.
    pause
    exit /b 1
)

:: Arrancar en una ventana nueva de PowerShell (queda visible para ver los commits)
start "Git Watcher - FuelLog" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0git-watcher.ps1"

echo  [OK] Watcher iniciado en ventana separada.
echo  Puedes minimizarla - los commits apareceran ahi.
echo.
timeout /t 3 >nul
