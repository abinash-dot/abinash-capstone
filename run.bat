@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Starting ECL-Pro: Ind AS 109 Working Paper
echo ========================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy ".env.example" ".env" >nul
    )
)

:: 3. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: 4. Open the browser after 2 seconds in the background
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: 5. Start development server
echo.
echo [INFO] Starting Vite development server on http://localhost:3000...
echo Press Ctrl+C in this window to stop the server.
echo.
call npm run dev

pause
