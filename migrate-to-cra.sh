#!/bin/bash

echo "🚀 Migrating from Vite to Create React App..."

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "❌ Error: 'client' directory not found. Please run this script from the project root."
    exit 1
fi

# Create backup of original client
echo "📦 Creating backup of original client..."
cp -r client client-backup-vite

# Create new CRA project
echo "🔧 Creating new Create React App project..."
npx create-react-app client-cra --yes

# Install dependencies
echo "📦 Installing dependencies..."
cd client-cra
npm install axios bootstrap react-bootstrap react-router-dom react-toastify react-helmet react-icons react-dropzone react-pdf html2canvas jspdf moment aos framer-motion react-countdown file-saver pdfjs-dist

# Copy source files
echo "📁 Copying source files..."
cp -r ../client/src/* src/
cp -r ../client/public/* public/

# Update package.json name
echo "📝 Updating package.json..."
sed -i '' 's/"name": "client-cra"/"name": "print-repository-client"/' package.json

# Create .env file
echo "⚙️ Creating environment file..."
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001/api
EOF

echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. cd client-cra"
echo "2. npm start"
echo "3. Test the application"
echo ""
echo "🔧 If you encounter any issues:"
echo "- Check the console for errors"
echo "- Verify all dependencies are installed"
echo "- Ensure the backend server is running"
echo ""
echo "📁 Original Vite project backed up as 'client-backup-vite'" 