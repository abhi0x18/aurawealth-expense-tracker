@echo off
setlocal
echo ===================================================
echo   Starting PaisaPilot - Personal Finance Manager
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js (v18+) to run PaisaPilot.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [INFO] Dependencies not detected. Running initial setup first...
    call setup.bat
)

if not exist prisma\dev.db (
    echo [INFO] SQLite database not detected. Running database initialization...
    call npx prisma db push
)

echo [INFO] Launching PaisaPilot server...
echo Access URL: http://localhost:3000
echo Press Ctrl+C in this console window to stop the server.
echo.

:: Automatically launch default browser to localhost:3000 in 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Start Next.js server
call npm run dev
