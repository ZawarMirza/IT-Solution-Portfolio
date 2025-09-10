# IT Solution Portfolio - Frontend Project Structure

## Overview
This is a React-based frontend application with comprehensive user authentication and role-based access control system.

## Project Structure

```
src/
├── components/                 # Reusable UI components
│   ├── navigation/            # Navigation components
│   │   ├── AdminNavigation.js
│   │   ├── GuestNavigation.js
│   │   └── UserNavigation.js
│   ├── Navigation.js          # Main navigation component
│   ├── ProtectedRoute.js      # Route protection component
│   ├── RoleBasedRender.js     # Conditional rendering based on roles
│   └── SessionTimeoutModal.js # Session timeout warning modal
│
├── context/                   # React Context providers
│   ├── AuthContext.js         # Authentication context and provider
│   ├── ThemeContext.js        # Theme management context
│   └── index.js              # Context exports
│
├── hooks/                     # Custom React hooks
│   └── useSession.js         # Session management hook
│
├── pages/                     # Page components
│   ├── auth/                 # Authentication pages
│   │   ├── LoginPage.js      # User login
│   │   ├── SignupPage.js     # User registration
│   │   ├── EmailVerificationPage.js # Email verification
│   │   ├── ForgotPasswordPage.js    # Password reset request
│   │   └── ResetPasswordPage.js     # Password reset form
│   │
│   ├── admin/                # Admin-only pages
│   │   ├── AdminUsersPage.js
│   │   ├── AdminContentPage.js
│   │   └── AdminSettingsPage.js
│   │
│   ├── user/                 # User-specific pages
│   │   ├── UserProfilePage.js
│   │   ├── UserPublicationsPage.js
│   │   ├── UserRepositoriesPage.js
│   │   └── UserSettingsPage.js
│   │
│   ├── dashboard/            # Dashboard components
│   │   ├── AdminDashboard.js
│   │   └── UserDashboard.js
│   │
│   └── [Public Pages]        # Public accessible pages
│       ├── HomePage.js
│       ├── AboutPage.js
│       ├── ProductsPage.js
│       ├── DashboardPage.js
│       ├── UnauthorizedPage.js
│       └── NotFoundPage.js
│
├── __tests__/                # Test files
│   └── AuthFlow.test.js      # Authentication flow tests
│
├── App.js                    # Main application component
├── index.js                  # Application entry point
└── index.css                 # Global styles
```

## Authentication System Features

### 1. User Roles
- **Admin**: Full access to manage all content, users, and system settings
- **Registered User**: Can download free publications, rate/comment, view repositories
- **Guest**: View-only access to non-premium content

### 2. Authentication Features
- ✅ User Registration with email verification
- ✅ User Login with remember me option
- ✅ Password reset functionality
- ✅ Session-based access control with automatic timeout
- ✅ JWT token management with automatic refresh
- ✅ Role-based route protection
- ✅ Session timeout warnings

### 3. Security Features
- JWT token-based authentication
- Automatic token refresh on expiry
- Session timeout management (15 minutes default)
- Protected routes based on user roles
- Secure password validation
- Email verification for new accounts

## Route Structure

### Public Routes
- `/` - Home page
- `/about` - About page
- `/products` - Products page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password/:token` - Password reset form
- `/verify-email/:token` - Email verification

### Protected Routes (Authenticated Users)
- `/dashboard` - User dashboard (role-based content)

### Admin Routes (Admin Role Required)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/content` - Content management
- `/admin/settings` - System settings

### User Routes (User Role Required)
- `/user/profile` - User profile
- `/user/publications` - User publications
- `/user/repositories` - User repositories
- `/user/settings` - User settings

## Environment Configuration

### Required Environment Variables
```env
REACT_APP_API_URL=http://localhost:5119/api
REACT_APP_SESSION_TIMEOUT=900000
REACT_APP_TOKEN_REFRESH_THRESHOLD=300000
```

### Backend API Endpoints
The frontend expects the following API endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email

## Development Guidelines

### Import Conventions
- Use relative imports for context: `import { useAuth } from '../../context';`
- Components should be organized by feature/domain
- Maintain consistent file naming (PascalCase for components)

### Code Organization
- Components are organized by functionality and access level
- Authentication logic is centralized in AuthContext
- Route protection is handled by ProtectedRoute component
- Session management is handled by useSession hook

### Testing
- Authentication flow tests are included
- Component tests should be added for each major feature
- Integration tests for complete user flows

## Getting Started

1. Install dependencies: `npm install`
2. Configure environment variables
3. Start development server: `npm start`
4. Run tests: `npm test`
5. Build for production: `npm run build`

## Professional Standards

This project follows:
- React best practices and hooks patterns
- Component composition and reusability
- Separation of concerns
- Security best practices for authentication
- Responsive design with Tailwind CSS
- Clean code principles and consistent formatting
