#!/bin/bash
# =====================================================
# BURNBACK ITR FILING PLATFORM - STARTUP SCRIPT
# Installs dependencies and starts both servers
# =====================================================

echo ""
echo "====================================================="
echo "  BURNBACK ITR FILING PLATFORM - STARTUP"
echo "====================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo ""

# Install root dependencies
echo "====================================================="
echo "  INSTALLING ROOT DEPENDENCIES"
echo "====================================================="
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

# Install backend dependencies
echo ""
echo "====================================================="
echo "  INSTALLING BACKEND DEPENDENCIES"
echo "====================================================="
cd backend
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "====================================================="
echo "  INSTALLING FRONTEND DEPENDENCIES"
echo "====================================================="
cd frontend
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "====================================================="
echo "  DEPENDENCIES INSTALLED SUCCESSFULLY!"
echo "====================================================="
echo ""

# Start backend server
echo "====================================================="
echo "  STARTING BACKEND SERVER (Port 3002)"
echo "====================================================="
gnome-terminal --title="Burnblack Backend" -- bash -c "cd backend && npm run dev; exec bash" 2>/dev/null || \
xterm -title "Burnblack Backend" -e "cd backend && npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd backend && npm run dev"' 2>/dev/null || \
echo "Starting backend in background..."

# Wait for backend to start
sleep 5

# Start frontend server
echo "====================================================="
echo "  STARTING FRONTEND SERVER (Port 3000)"
echo "====================================================="
gnome-terminal --title="Burnblack Frontend" -- bash -c "cd frontend && npm start; exec bash" 2>/dev/null || \
xterm -title "Burnblack Frontend" -e "cd frontend && npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd frontend && npm start"' 2>/dev/null || \
echo "Starting frontend in background..."

# Wait for frontend to start
sleep 5

echo ""
echo "====================================================="
echo "  PLATFORM STARTUP COMPLETE!"
echo "====================================================="
echo ""
echo "Backend Server:  http://localhost:3002"
echo "Frontend Server: http://localhost:3000"
echo ""
echo "Both servers are starting in separate terminals."
echo "Close those terminals to stop the servers."
echo ""
echo "Press any key to exit this startup script..."
read -n 1
