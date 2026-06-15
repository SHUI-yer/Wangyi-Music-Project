@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: Lock directory
cd /d "%~dp0"

echo ==========================================
echo    Netease Music Vue - Startup Script
echo ==========================================

:: 1. Check environment
echo [1/3] Checking environment...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: 2. Install dependencies
if not exist "apps\frontend\node_modules" (
    echo [2/3] Installing dependencies...
    cd apps\frontend
    call npm install
    cd ..\..
) else (
    echo [2/3] Dependencies already installed. Skipping...
)

:: 3. Start project
echo [3/3] Starting development server...
cd apps\frontend
call npm run dev

pause