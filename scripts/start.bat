@echo off
chcp 65001 >nul
echo ==========================================
echo   Netease Music Mimic - Startup Script
echo ==========================================

:: Switch to project root
cd /d "%~dp0.."

echo [1/3] Checking environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is NOT installed.
    echo Please install it from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Entering apps/frontend...
cd apps/frontend
if errorlevel 1 (
    echo [ERROR] Folder apps/frontend not found!
    pause
    exit /b 1
)

if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
)

echo [3/3] Starting server...
echo Please visit: http://localhost:3000
echo.
call npm run dev
if errorlevel 1 (
    echo [ERROR] Failed to start.
    pause
    exit /b 1
)
pause
