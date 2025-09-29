# =====================================================
# BURNBACK ITR FILING PLATFORM - STARTUP SCRIPT (PowerShell)
# Installs dependencies and starts both servers
# =====================================================

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  BURNBACK ITR FILING PLATFORM - STARTUP" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install root dependencies
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  INSTALLING ROOT DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  INSTALLING BACKEND DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Set-Location backend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Install frontend dependencies
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  INSTALLING FRONTEND DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Set-Location frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  DEPENDENCIES INSTALLED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  STARTING BACKEND SERVER (Port 3002)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  STARTING FRONTEND SERVER (Port 3000)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  PLATFORM STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Server:  http://localhost:3002" -ForegroundColor Yellow
Write-Host "Frontend Server: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Both servers are starting in separate PowerShell windows." -ForegroundColor White
Write-Host "Close those windows to stop the servers." -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit this startup script"
