# Creates a desktop shortcut to start_team.bat
# Run once: right-click this file -> Run with PowerShell

$batPath  = "C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\start_team.bat"
$lnkPath  = [Environment]::GetFolderPath('Desktop') + "\Max Agent Team.lnk"
$iconPath = "C:\Program Files\Google\Chrome\Application\chrome.exe,0"

$shell     = New-Object -ComObject WScript.Shell
$shortcut  = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath       = $batPath
$shortcut.WorkingDirectory = "C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam"
$shortcut.Description      = "Start Max Agent Team server and open Command Center"
$shortcut.WindowStyle      = 7   # minimized (so the cmd window doesn't stay open)

# Use Chrome icon if available, otherwise use default
if (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    $shortcut.IconLocation = $iconPath
} elseif (Test-Path "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe") {
    $shortcut.IconLocation = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe,0"
}

$shortcut.Save()
Write-Host "Shortcut created: $lnkPath" -ForegroundColor Green
Write-Host "Double-click 'Max Agent Team' on your desktop to launch." -ForegroundColor Cyan
