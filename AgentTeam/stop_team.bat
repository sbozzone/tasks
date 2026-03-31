@echo off
echo Stopping Max Agent Team server...

:: Find and kill the process listening on port 8765
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| find ":8765" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Server stopped.
