# Excel Analytics Platform

## Overview
A comprehensive full-stack Excel Analytics Platform built with JavaScript/JSX, Express.js, and PostgreSQL. Features role-based authentication, file upload processing, dynamic 2D/3D chart generation, and admin management capabilities.

## Project Architecture

### Backend (Express.js + PostgreSQL)
- **Authentication**: JWT-based auth with role-based access control (admin, user)
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **File Processing**: Excel (.xlsx, .xls) upload and parsing with XLSX library
- **Chart Generation**: Server-side data processing for visualization
- **Admin Management**: User management and system analytics

### Frontend (React + JSX)
- **Framework**: React with JSX (not TypeScript) as specifically requested
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Chart.js for 2D charts, Three.js for 3D visualizations
- **File Upload**: Custom upload component with progress tracking

### Key Features Implemented
- ✅ User authentication (login, register, logout)
- ✅ Role-based access control (admin/user roles)
- ✅ Excel file upload and processing
- ✅ Dynamic chart creation (bar, line, pie, scatter)
- ✅ 3D chart visualization support
- ✅ Admin dashboard with user/file/chart management
- ✅ Responsive design with mobile navigation
- ✅ File management with detailed sheet information
- ✅ Chart viewer with download functionality

## File Structure
```
├── server/
│   ├── index.js           # Main server entry
│   ├── routes.js          # API route definitions
│   ├── auth.js           # Authentication middleware
│   ├── excel-processor.js # Excel file processing
│   └── storage.js        # Database operations
├── client/src/
│   ├── pages/            # Application pages
│   ├── components/       # Reusable components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── shared/
│   └── schema.js        # Database schema definitions
└── index.html           # Main HTML template
```

## User Preferences
- **Language**: JavaScript with JSX files (not TypeScript)
- **Database**: PostgreSQL (platform constraint, not MongoDB)
- **Framework**: Express.js + React following MERN principles
- **Authentication**: JWT-based with role management
- **Charts**: Support for both 2D (Chart.js) and 3D (Three.js) visualizations

## Recent Changes (Latest)
- **2025-01-08**: Created complete frontend architecture with all major components
- **2025-01-08**: Implemented authentication system with role-based routing
- **2025-01-08**: Built comprehensive admin dashboard with user management
- **2025-01-08**: Created chart creation and viewing functionality
- **2025-01-08**: Implemented file upload with Excel processing
- **2025-01-08**: Added responsive navigation and mobile support
- **2025-01-08**: Integrated Chart.js and Three.js for visualizations
- **2025-01-08**: Resolved server startup issues and deployed working platform
- **2025-01-08**: Created comprehensive local setup documentation and scripts

## Development Status
**Current Phase**: Application deployment and preview configuration
**Issue Resolved**: Fixed path-to-regexp server startup error with clean Express setup
**Next Steps**: Ensure preview is accessible for user testing
**Ready for**: Full platform testing with mock authentication

## Technical Decisions
1. **JSX over TSX**: User specifically requested plain JavaScript with JSX
2. **PostgreSQL over MongoDB**: Platform limitation, adapted MERN principles
3. **Drizzle ORM**: Modern TypeScript ORM adapted for JavaScript usage
4. **TanStack Query**: Robust server state management for React
5. **Tailwind CSS**: Utility-first CSS for rapid responsive development
6. **Three.js Integration**: For advanced 3D chart visualizations