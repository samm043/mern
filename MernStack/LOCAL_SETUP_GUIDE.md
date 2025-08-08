# Excel Analytics Platform - Local Setup Guide

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** (v13 or higher) - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

## Project Download & Installation

### 1. Download Project Files

Since this project was built in Replit, you'll need to download all the files. Create a new folder and copy all project files:

```bash
# Create project directory
mkdir excel-analytics-platform
cd excel-analytics-platform

# Copy all files from Replit to this directory
# You should have the following structure:
```

```
excel-analytics-platform/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       └── index.css
├── server/
│   └── server.js
├── shared/
│   └── schema.js
├── uploads/ (create this folder)
├── package.json
├── vite.config.js
├── drizzle.config.js
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── run-app.js
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

## Database Setup

### 1. Install PostgreSQL

**Windows:**
- Download PostgreSQL installer from official website
- Run installer and set up a password for postgres user
- Note the port (default: 5432)

**macOS:**
- Using Homebrew: `brew install postgresql`
- Start service: `brew services start postgresql`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database for the project
CREATE DATABASE excel_analytics;

# Create a user (optional, for security)
CREATE USER excel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE excel_analytics TO excel_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/excel_analytics

# Or if you created a specific user:
# DATABASE_URL=postgresql://excel_user:your_password@localhost:5432/excel_analytics

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Setup Database Schema

```bash
# Push the database schema to PostgreSQL
npx drizzle-kit push
```

## Running the Application

### Option 1: Using the Built-in Script (Recommended)

```bash
# Run both backend and frontend simultaneously
node run-app.js
```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend development server on `http://localhost:5173`

### Option 2: Manual Setup (Two Terminals)

**Terminal 1 - Backend:**
```bash
node server/server.js
```

**Terminal 2 - Frontend:**
```bash
npx vite --host localhost --port 5173
```

### Option 3: Using Concurrently

Add this script to `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"node server/server.js\" \"vite --host localhost --port 5173\"",
    "server": "node server/server.js",
    "client": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Then run:
```bash
npm run dev
```

## Accessing the Application

Once both servers are running:

1. **Frontend**: Open `http://localhost:5173` in your browser
2. **Backend API**: Available at `http://localhost:3000`

## Test Credentials

The application comes with pre-configured test accounts:

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

**Regular User Account:**
- Email: `user@test.com`
- Password: `user123`

## Features Available

✅ **Authentication System**
- Login/Register functionality
- Role-based access (Admin/User)
- JWT token management

✅ **Dashboard**
- Analytics overview
- Recent files and charts
- User statistics

✅ **File Management**
- Excel file upload (.xlsx, .xls, .csv)
- File processing and sheet detection
- File deletion and management

✅ **Chart Creation**
- Dynamic 2D charts (Bar, Line, Pie, Scatter)
- 3D visualizations (3D Bar, 3D Scatter)
- Interactive chart viewer

✅ **Admin Panel** (Admin role only)
- User management
- System-wide file oversight
- Chart management

## Project Structure

```
├── client/src/
│   ├── pages/           # React pages (JSX)
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UploadPage.jsx
│   │   ├── FilesPage.jsx
│   │   ├── ChartsPage.jsx
│   │   ├── ChartCreate.jsx
│   │   ├── ChartView.jsx
│   │   └── AdminPage.jsx
│   ├── components/      # Reusable components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and configuration
├── server/
│   └── server.js       # Express.js API server
├── shared/
│   └── schema.js       # Database schema (Drizzle ORM)
└── uploads/            # File upload directory
```

## Development Notes

### Database Connection

- The app uses PostgreSQL with Drizzle ORM
- Schema is defined in `shared/schema.js`
- Currently configured for mock data, but ready for full database integration

### File Uploads

- Files are stored in the `uploads/` directory
- Supported formats: .xlsx, .xls, .csv
- Maximum file size: 10MB

### API Endpoints

All API endpoints are prefixed with `/api`:

- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- **Dashboard**: `/api/dashboard/stats`
- **Files**: `/api/files`, `/api/files/upload`
- **Charts**: `/api/charts`
- **Admin**: `/api/admin/users`, `/api/admin/files`, `/api/admin/charts`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists and user has permissions

2. **Port Already in Use**
   - Change ports in the configuration
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

3. **Module Not Found**
   - Run `npm install` to install missing dependencies
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Upload Directory Permissions**
   - Ensure uploads/ directory exists and is writable
   - Create manually: `mkdir uploads`

### Environment Setup

If you encounter issues with the environment:

1. Node.js version: Ensure you're using Node.js v18+
2. PostgreSQL version: Use PostgreSQL v13+
3. Dependencies: Run `npm audit` to check for issues

## Production Deployment

For production deployment:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Configure production environment variables:**
   - Set proper DATABASE_URL for production database
   - Generate secure SESSION_SECRET
   - Configure CORS origins for your domain

3. **Serve static files:**
   - Configure Express to serve built frontend files
   - Set up proper SSL certificates
   - Configure reverse proxy (nginx recommended)

## Support

The Excel Analytics Platform includes:
- Comprehensive error handling
- Responsive design for mobile devices
- Role-based authentication system
- File processing capabilities
- Interactive data visualizations

For additional customization or issues, refer to the component files in the `client/src/` directory.