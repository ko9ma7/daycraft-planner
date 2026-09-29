@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo DayCraft Planner - GitHub deployment
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-github.ps1"
echo.
echo ============================================================
echo  DayCraft GitHub deployment process has finished.
echo  If you see an ERROR above, send a screenshot of that line.
echo ============================================================
pause
