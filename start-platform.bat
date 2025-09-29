@echo off
echo.
echo =====================================================
echo   BURNBACK ITR FILING PLATFORM - STARTUP
echo =====================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

REM Install root dependencies
echo =====================================================
echo   INSTALLING ROOT DEPENDENCIES
echo =====================================================
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo.
echo =====================================================
echo   INSTALLING BACKEND DEPENDENCIES
echo =====================================================
cd backend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo.
echo =====================================================
echo   INSTALLING FRONTEND DEPENDENCIES
echo =====================================================
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo =====================================================
echo   DEPENDENCIES INSTALLED SUCCESSFULLY!
echo =====================================================
echo.

REM Start backend server
echo =====================================================
echo   STARTING BACKEND SERVER (Port 3002)
echo =====================================================
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
echo =====================================================
echo   STARTING FRONTEND SERVER (Port 3000)
echo =====================================================
start "Frontend Server" cmd /k "cd frontend && npm start"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo =====================================================
echo   PLATFORM STARTUP COMPLETE!
echo =====================================================
echo.
echo Backend Server:  http://localhost:3002
echo Frontend Server: http://localhost:3000
echo.
echo Both servers are starting in separate command windows.
echo Close those windows to stop the servers.
echo.
pause