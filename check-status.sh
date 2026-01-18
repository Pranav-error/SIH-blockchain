#!/bin/bash

echo "🔍 HerBlock System Status Check"
echo "=================================="
echo ""

# Check MongoDB
echo "1️⃣ MongoDB Status:"
if docker ps | grep -q herblock-mongo; then
    echo "   ✅ MongoDB is RUNNING"
else
    echo "   ❌ MongoDB is NOT running"
    echo "   Fix: docker start herblock-mongo"
fi
echo ""

# Check Backend
echo "2️⃣ Backend Status (Port 8000):"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "   ✅ Backend is RUNNING on http://127.0.0.1:8000"
    echo "   Check API docs: http://127.0.0.1:8000/docs"
else
    echo "   ❌ Backend is NOT running"
    echo "   Fix: cd backend && source venv/bin/activate && uvicorn server:app --reload"
fi
echo ""

# Check Frontend
echo "3️⃣ Frontend Status:"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is RUNNING on http://localhost:3000"
elif lsof -ti:3001 > /dev/null 2>&1; then
    echo "   ✅ Frontend is RUNNING on http://localhost:3001"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Fix: cd frontend && yarn start"
fi
echo ""

# Test Backend API
echo "4️⃣ Testing Backend API:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/docs)
if [ "$response" = "200" ]; then
    echo "   ✅ Backend API is responding (Status: $response)"
else
    echo "   ⚠️  Backend API status: $response"
fi
echo ""

echo "=================================="
echo "📝 Next Steps:"
echo ""
echo "If all services are running:"
echo "1. Open browser: http://localhost:3001/register (or 3000)"
echo "2. Register with:"
echo "   Username: admin"
echo "   Password: admin123"
echo "3. Then login with same credentials"
echo ""
echo "If registration fails, check backend terminal for error logs"
echo "=================================="
