#!/bin/bash

# Excel Analytics Platform - Local Setup Script
# This script helps set up the project on your local machine

echo "🚀 Excel Analytics Platform - Local Setup"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please install Node.js v18 or higher"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/"
    echo "   You can continue setup and install PostgreSQL later"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo "✅ Created uploads directory"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/excel_analytics

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (change this in production)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOL
    echo "✅ Created .env file - Please update DATABASE_URL with your PostgreSQL credentials"
else
    echo "✅ .env file already exists"
fi

# Add npm scripts to package.json if they don't exist
echo "📝 Adding npm scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  'dev': 'node run-app.js',
  'server': 'node server/server.js',
  'client': 'vite --host localhost --port 5173',
  'build': 'vite build',
  'preview': 'vite preview',
  'db:push': 'drizzle-kit push',
  'db:studio': 'drizzle-kit studio'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Added npm scripts');
"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Install and setup PostgreSQL if you haven't already"
echo "2. Create database: createdb excel_analytics"
echo "3. Update DATABASE_URL in .env file with your PostgreSQL credentials"
echo "4. Push database schema: npm run db:push"
echo "5. Start the application: npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3000"
echo ""
echo "Test credentials:"
echo "  Admin: admin@test.com / admin123"
echo "  User: user@test.com / user123"
echo ""
echo "📚 For detailed instructions, see LOCAL_SETUP_GUIDE.md"