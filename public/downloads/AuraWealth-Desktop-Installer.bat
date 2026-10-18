@echo off
title AuraWealth 3D Desktop App Setup
color 0A
cls
echo =====================================================================
echo           AuraWealth 3D — Desktop Application Installer
echo =====================================================================
echo.
echo Installing AuraWealth 3D Cockpit onto your Windows Desktop...
echo.

set TARGET_URL=http://localhost:3000
set SHORTCUT_NAME=AuraWealth 3D Cockpit.lnk
set DESKTOP_DIR=%USERPROFILE%\Desktop
set SHORTCUT_PATH=%DESKTOP_DIR%\%SHORTCUT_NAME%

:: Detect Browser Executable
set BROWSER_EXE=
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if "%BROWSER_EXE%"=="" (
    echo [!] Could not locate Edge or Chrome. Creating standard web shortcut...
    echo [InternetShortcut] > "%DESKTOP_DIR%\AuraWealth 3D.url"
    echo URL=%TARGET_URL% >> "%DESKTOP_DIR%\AuraWealth 3D.url"
    echo IconIndex=0 >> "%DESKTOP_DIR%\AuraWealth 3D.url"
    goto FINISH
)

echo [*] Detected Browser: %BROWSER_EXE%
echo [*] Generating standalone native app shortcut on Desktop...

:: Create VBS script to generate proper Windows .lnk shortcut with arguments
set VBS_SCRIPT=%TEMP%\CreateAuraWealthShortcut.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = "%SHORTCUT_PATH%" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%BROWSER_EXE%" >> "%VBS_SCRIPT%"
echo oLink.Arguments = "--app=""%TARGET_URL%"" --window-size=1366,860 --app-id=AuraWealthApp" >> "%VBS_SCRIPT%"
echo oLink.Description = "AuraWealth 3D — Spatial Personal Expense & Wealth Cockpit" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%USERPROFILE%" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript /nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

:FINISH
echo.
echo =====================================================================
echo [SUCCESS] AuraWealth 3D Desktop App installed successfully!
echo Shortcut created on your Desktop:
echo "%DESKTOP_DIR%\%SHORTCUT_NAME%"
echo.
echo Launching AuraWealth 3D Cockpit now...
echo =====================================================================
echo.

start "" "%BROWSER_EXE%" --app="%TARGET_URL%" --window-size=1366,860

timeout /t 3 >nul
exit
