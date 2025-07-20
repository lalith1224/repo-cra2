#!/bin/bash

# Print Repository System Startup Script (No Docker)

echo "🚀 Starting Print Repository System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if environment files exist
if [ ! -f ".env" ]; then
    echo "📝 Creating main environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env with your configuration before starting"
fi

if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp env.example server/.env
    echo "⚠️  Please edit server/.env with your configuration before starting"
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client environment file..."
    echo "REACT_APP_API_URL=http://localhost:5001" > client/.env
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/uploads server/logs server/reports server/tests

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed and directories created!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure PostgreSQL is running and accessible"
echo "2. Edit environment files with your configuration:"
echo "   - .env (main configuration)"
echo "   - server/.env (server configuration)"
echo "   - client/.env (client configuration)"
echo ""
echo "3. Start the application:"
echo "   # Terminal 1 - Start server"
echo "   cd server && npm run dev"
echo ""
echo "   # Terminal 2 - Start client"
echo "   cd client && npm start"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo ""
echo "5. Create admin user (first time only):"
echo "   curl -X POST http://localhost:5000/api/auth/setup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"admin\",\"password\":\"password123\",\"email\":\"admin@example.com\"}'"
echo ""
echo "🔧 Database Setup:"
echo "   # Create database (if not exists)"
echo "   createdb print_repository"
echo ""
echo "   # Or connect to existing database and update server/.env"
echo ""
echo "📚 For more information, see README.md" 