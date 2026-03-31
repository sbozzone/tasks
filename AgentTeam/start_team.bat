@echo off
title Max Agent Team
cd /d "C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam"

:: Check if server is already running on port 8765
netstat -aon 2>nul | find "8765" | find "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo Server already running on port 8765.
    goto :open
)

:: Start server minimized in background
echo Starting Max Agent Team server...
start /min "Max Agent Server" python server.py

:: Wait for server to initialize
timeout /t 2 /nobreak >nul

:open
:: Open Tasks at correct localhost URL (NOT file:///)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8765/owner-inbox/tasks.html" 2>nul
if errorlevel 1 (
  start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:8765/owner-inbox/tasks.html" 2>nul
  if errorlevel 1 (
    start http://localhost:8765/owner-inbox/tasks.html
  )
)

echo.
echo Tasks:          http://localhost:8765/owner-inbox/tasks.html
echo Command Center: http://localhost:8765/owner-inbox/stephen_ai_command_center_v3.html
echo Run stop_team.bat when done.
