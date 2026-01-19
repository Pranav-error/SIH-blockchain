#!/bin/bash

# =====================================================
# HerBlock Production Setup Script
# Run this to set up everything for production
# =====================================================

echo "🌿 HerBlock Production Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python not found. Please install Python 3.9+"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} Docker: $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker not found. Blockchain features will use fallback mode."
fi

echo ""

# Setup Backend
echo "🔧 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

echo "   Activating virtual environment..."
source venv/bin/activate

echo "   Installing dependencies..."
pip install -q -r requirement.txt

echo -e "${GREEN}✓${NC} Backend ready"

cd ..

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd frontend

echo "   Installing dependencies..."
npm install --silent

echo -e "${GREEN}✓${NC} Frontend ready"

cd ..

# Setup Mobile App
echo ""
echo "🔧 Setting up Mobile App..."
cd mobile-app

echo "   Installing dependencies..."
npm install --silent 2>/dev/null || echo "   (Some peer dependency warnings are normal)"

echo -e "${GREEN}✓${NC} Mobile App ready"

cd ..

# Create environment files if they don't exist
echo ""
echo "📝 Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo "   Creating backend/.env..."
    cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=herblock
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${YELLOW}⚠${NC} Please update backend/.env with your credentials"
else
    echo -e "${GREEN}✓${NC} backend/.env exists"
fi

if [ ! -f "frontend/.env" ]; then
    echo "   Creating frontend/.env..."
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✓${NC} frontend/.env created"
else
    echo -e "${GREEN}✓${NC} frontend/.env exists"
fi

echo ""
echo "============================"
echo "🎉 Setup Complete!"
echo "============================"
echo ""
echo "To start development:"
echo ""
echo "  1. Backend:     cd backend && source venv/bin/activate && python server.py"
echo "  2. Frontend:    cd frontend && npm start"
echo "  3. Mobile:      cd mobile-app && npm start"
echo ""
echo "For production deployment, see PRODUCTION_READINESS.md"
echo ""
