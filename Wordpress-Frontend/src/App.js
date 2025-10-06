// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, ROLES } from "./context";
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminDomainsPage from './pages/admin/AdminDomainsPage';
import AdminPublicationsPage from './pages/admin/AdminPublicationsPage';
import AdminRepositoriesPage from './pages/admin/AdminRepositoriesPage';

// Dashboard Components
import UserDashboard from './pages/dashboard/UserDashboard';

// Role-based redirect component
import RoleBasedRedirect from './components/RoleBasedRedirect';

// User Pages
import UserProfilePage from './pages/user/UserProfilePage';
import UserPublicationsPage from './pages/user/UserPublicationsPage';
import UserRepositoriesPage from './pages/user/UserRepositoriesPage';
import UserSettingsPage from './pages/user/UserSettingsPage';

// Layout Components
import AdminLayoutComponent from './components/AdminLayout';
import UserLayout from './components/UserLayout';

// Session Timeout
import SessionTimeoutModal from './components/SessionTimeoutModal';

// Import Tailwind's base styles
import './index.css';

// Layout components for different route groups
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navigation />
    {/* ✅ Removed padding and container spacing */}
    <main className="w-full flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="bg-white shadow-sm">
      {/* ✅ Removed container padding */}
      <div className="w-full px-0">
        <div className="flex justify-between h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
            Your Logo
          </Link>
        </div>
      </div>
    </div>
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  </div>
);

const AdminLayout = () => (
  <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
    <AdminLayoutComponent />
  </ProtectedRoute>
);

const UserDashboardLayout = () => (
  <ProtectedRoute requiredRoles={[ROLES.USER, ROLES.ADMIN]}>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

const AuthenticatedLayout = () => (
  <ProtectedRoute>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout><Outlet /></MainLayout>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/not-found" element={<NotFoundPage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout><Outlet /></AuthLayout>}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Dashboard - Redirect based on role */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Admin routes - Protected by Admin role */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <AdminLayoutComponent />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="domains" element={<AdminDomainsPage />} />
            <Route path="publications" element={<AdminPublicationsPage />} />
            <Route path="repositories" element={<AdminRepositoriesPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* User routes - Protected by User role */}
          <Route path="/user" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="publications" element={<UserPublicationsPage />} />
            <Route path="repositories" element={<UserRepositoriesPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>

          {/* Additional authenticated routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Navigate to="/user/profile" replace />
            </ProtectedRoute>
          } />
          
          {/* Legacy routes - redirect to new paths */}
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/publications" element={<Navigate to="/user/publications" replace />} />
          <Route path="/repositories" element={<Navigate to="/user/repositories" replace />} />

          {/* 404 Page - Must be the last route */}
          <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
        </Routes>
        
        {/* Session Timeout Modal */}
        <SessionTimeoutModal />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
