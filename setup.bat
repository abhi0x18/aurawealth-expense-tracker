@echo off
setlocal
echo ===================================================
echo   PaisaPilot - Personal Finance Manager Setup
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js (v18+) to run PaisaPilot.
    pause
    exit /b 1
)

echo [1/4] Checking environment configuration...
if not exist .env (
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
    ) else (
        echo Creating default .env...
        echo DATABASE_URL="file:./dev.db" > .env
        echo JWT_SECRET="paisapilot-super-secure-local-session-secret-change-me-if-needed" >> .env
        echo NEXT_PUBLIC_APP_NAME="PaisaPilot — Personal Finance Manager" >> .env
    )
)

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed. Please check the error messages above.
    pause
    exit /b 1
)

echo [3/4] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma client generation failed.
    pause
    exit /b 1
)

echo [4/4] Setting up SQLite database...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Database schema sync failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   Setup completed successfully!
echo   Run start.bat to launch PaisaPilot.
echo ===================================================
echo.
pause
