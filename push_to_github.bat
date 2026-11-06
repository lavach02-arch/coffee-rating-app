@echo off
title Push Coffee Rating App to GitHub
echo ===================================================
echo Pushing Coffee Rating App to GitHub...
echo Repository: https://github.com/lavach02-arch/coffee-rating-app.git
echo ===================================================
echo.

set "PATH=C:\Users\SUBHASHINI\.gemini\antigravity\scratch\git\cmd;%PATH%"
cd /d "C:\Users\SUBHASHINI\.gemini\antigravity\scratch\coffee-rating-app"

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo [SUCCESS] Your project has been successfully pushed to GitHub!
    echo Visit: https://github.com/lavach02-arch/coffee-rating-app
    echo ===================================================
) else (
    echo ===================================================
    echo [ERROR] Push failed or was canceled.
    echo ===================================================
)
echo.
pause
