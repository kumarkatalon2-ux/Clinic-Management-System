#!/bin/bash
# Setup script for Clinical Management System

set -e

echo "=================================="
echo "🏥 Clinical System - Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd src/backend
npm install
cd ../..

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd src/frontend
npm install
cd ../..

echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create .env file: cp .env.example .env"
echo "2. Start development: npm run dev (from src/backend or src/frontend)"
echo "3. Backend: cd src/backend && npm run dev"
echo "4. Frontend: cd src/frontend && npm run dev"
echo "5. API will be available at http://localhost:3000"
echo "6. Frontend will be available at http://localhost:5173"
echo ""
