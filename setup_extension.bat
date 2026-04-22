@echo off
cls
echo ========================================
echo Cyberbullying Detector - Setup Script
echo ========================================
echo.

echo Checking if required files exist...
if not exist "fastapi_backend.py" (
    echo ERROR: fastapi_backend.py not found!
    echo Please run this script from the main project directory.
    pause
    exit /b 1
)

if not exist "chrome_extension" (
    echo ERROR: chrome_extension folder not found!
    echo Please make sure the extension files are in place.
    pause
    exit /b 1
)

echo ✓ All required files found
echo.

echo Starting FastAPI backend server...
echo This will run in the background. Close this window to stop the server.
echo.
start "FastAPI Server" python fastapi_backend.py

timeout /t 5 /nobreak >nul

echo.
echo Opening Chrome extension installation page...
start chrome "chrome://extensions/"

echo.
echo Opening test page...
timeout /t 2 /nobreak >nul
start "" "chrome_extension\test_page.html"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. In Chrome extensions page, enable "Developer mode"
echo 2. Click "Load unpacked" 
echo 3. Select the "chrome_extension" folder
echo 4. Visit the test page and try selecting text
echo 5. Click the extension icon to analyze
echo.
echo The FastAPI server is running in a separate window.
echo Close that window when you're done testing.
echo.
pause