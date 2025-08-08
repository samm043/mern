@echo off
REM Excel Analytics Platform - Local Setup Script for Windows
REM This script helps set up the project on your local Windows machine

echo 🚀 Excel Analytics Platform - Local Setup
echo =========================================

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node -v

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/
    echo    You can continue setup and install PostgreSQL later
)

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    mkdir uploads
    echo ✅ Created uploads directory
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📄 Creating .env file...
    (
    echo # Database Configuration
    echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/excel_analytics
    echo.
    echo # Server Configuration
    echo PORT=3000
    echo NODE_ENV=development
    echo.
    echo # Session Secret ^(change this in production^)
    echo SESSION_SECRET=your-super-secret-session-key-change-this-in-production
    echo.
    echo # CORS Origins
    echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ) > .env
    echo ✅ Created .env file - Please update DATABASE_URL with your PostgreSQL credentials
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Install and setup PostgreSQL if you haven't already
echo 2. Create database using PostgreSQL command: createdb excel_analytics
echo 3. Update DATABASE_URL in .env file with your PostgreSQL credentials
echo 4. Push database schema: npm run db:push
echo 5. Start the application: npm run dev
echo.
echo The application will be available at:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:3000
echo.
echo Test credentials:
echo   Admin: admin@test.com / admin123
echo   User: user@test.com / user123
echo.
echo 📚 For detailed instructions, see LOCAL_SETUP_GUIDE.md
echo.
pause