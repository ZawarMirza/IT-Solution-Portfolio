# Application Routes Documentation

## Route Structure Overview

### Public Routes (No Authentication Required)
```
/ - Home page
/about - About page  
/products - Products page
/login - User login
/register - User registration
/forgot-password - Password reset request
/reset-password/:token - Password reset form
/verify-email/:token - Email verification
/unauthorized - Access denied page
/not-found - 404 error page
```

### Protected Routes (Authentication Required)

#### General Authenticated Routes
```
/dashboard - Main dashboard (role-based content)
/profile - Redirects to /user/profile
```

#### Admin Routes (Admin Role Required)
```
/admin - Admin dashboard (redirects to /admin/dashboard)
/admin/dashboard - Admin dashboard page
/admin/users - User management
/admin/content - Content management  
/admin/settings - System settings
```

#### User Routes (User/Admin Role Required)
```
/user - User area (redirects to /user/profile)
/user/profile - User profile page
/user/publications - User publications
/user/repositories - User repositories
/user/settings - User account settings
```

### Legacy Route Redirects
```
/signup → /register
/admin/dashboard → /admin
/publications → /user/publications
/repositories → /user/repositories
```

## Role-Based Access Control

### Guest Users (Not Authenticated)
- Can access: Public routes only
- Redirected to: `/login` when accessing protected routes

### Registered Users (USER role)
- Can access: Public routes + User routes + Dashboard
- Cannot access: Admin routes
- Redirected to: `/unauthorized` when accessing admin routes

### Admin Users (ADMIN role)  
- Can access: All routes (Public + User + Admin + Dashboard)
- Full system access

## Route Protection Implementation

### Layout Components
- `MainLayout` - Standard layout with navigation
- `AuthLayout` - Layout for authentication pages
- `AdminLayout` - Protected layout for admin routes
- `UserLayout` - Protected layout for user routes (accessible by USER and ADMIN)
- `AuthenticatedLayout` - Protected layout for any authenticated user

### Protection Logic
- `ProtectedRoute` component handles authentication checks
- Role-based access control via `requiredRoles` prop
- Automatic redirects based on authentication status
- Session timeout handling with warnings

## Navigation Components

### AdminNavigation
- Dashboard (/admin)
- Users (/admin/users)
- Content (/admin/content)
- Settings (/admin/settings)

### UserNavigation  
- Dashboard (/dashboard)
- Profile (/user/profile)
- Publications (/user/publications)
- Repositories (/user/repositories)
- Settings (/user/settings)

### GuestNavigation
- Home (/)
- Products (/products)
- About (/about)

## Route Configuration Best Practices

1. **Nested Routes**: Admin and User routes use nested routing with `<Outlet />`
2. **Role Inheritance**: Admin users can access user routes (UserLayout allows both USER and ADMIN roles)
3. **Fallback Routes**: 404 handling with `*` route at the end
4. **Legacy Support**: Redirects for old route patterns
5. **Security**: All protected routes wrapped in `ProtectedRoute` component
6. **UX**: Meaningful redirects and error pages for unauthorized access

## Authentication Flow

1. **Login Success**: 
   - Admin → `/admin/dashboard`
   - User → `/user/profile`
   - Redirect to intended route if available

2. **Logout**: 
   - Clear session data
   - Redirect to `/login`

3. **Session Timeout**:
   - Show warning modal
   - Auto-logout after timeout
   - Redirect to `/login`

4. **Unauthorized Access**:
   - Redirect to `/unauthorized` with context
   - Show appropriate error message
   - Provide navigation options
