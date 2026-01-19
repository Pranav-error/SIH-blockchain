#!/bin/bash

# =====================================================
# HerBlock Quick Demo Script
# Start all services for a demo presentation
# =====================================================

echo "🌿 HerBlock Demo Startup"
echo "========================"
echo ""

# Function to check if a port is in use
port_in_use() {
    lsof -i:$1 > /dev/null 2>&1
}

# Kill existing processes on our ports
echo "🧹 Cleaning up existing processes..."

if port_in_use 8000; then
    echo "   Stopping existing backend on port 8000..."
    kill $(lsof -t -i:8000) 2>/dev/null
fi

if port_in_use 3000; then
    echo "   Stopping existing frontend on port 3000..."
    kill $(lsof -t -i:3000) 2>/dev/null
fi

echo ""

# Start Backend
echo "🚀 Starting Backend Server..."
cd backend
source venv/bin/activate 2>/dev/null || {
    echo "   Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -q -r requirement.txt
}
python server.py &
BACKEND_PID=$!
cd ..

echo "   Backend PID: $BACKEND_PID"
echo "   Waiting for backend to start..."
sleep 3

# Check if backend started
if port_in_use 8000; then
    echo "   ✅ Backend running on http://localhost:8000"
else
    echo "   ❌ Backend failed to start"
fi

echo ""

# Start Frontend
echo "🚀 Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "   Frontend PID: $FRONTEND_PID"
echo "   Waiting for frontend to start..."
sleep 5

echo ""
echo "========================"
echo "🎉 Demo Ready!"
echo "========================"
echo ""
echo "Services:"
echo "  • Backend API:  http://localhost:8000"
echo "  • Frontend:     http://localhost:3000"
echo "  • API Docs:     http://localhost:8000/docs"
echo ""
echo "Demo Accounts:"
echo "  • Collector: collector@herblock.io / test1234"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to cleanup
trap cleanup INT

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Done. Goodbye!"
    exit 0
}

# Wait for processes
wait
