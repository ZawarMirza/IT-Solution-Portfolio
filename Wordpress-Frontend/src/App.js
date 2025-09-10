// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, ROLES } from "./context";
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

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

// Dashboard & Protected Pages
import DashboardPage from './pages/DashboardPage';

// Admin Pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Dashboard Components
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';

// User Pages
import UserProfilePage from './pages/user/UserProfilePage';
import UserPublicationsPage from './pages/user/UserPublicationsPage';
import UserRepositoriesPage from './pages/user/UserRepositoriesPage';
import UserSettingsPage from './pages/user/UserSettingsPage';

// Session Timeout
import SessionTimeoutModal from './components/SessionTimeoutModal';

// Import Tailwind's base styles
import './index.css';

// Layout components for different route groups
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    {children}
  </div>
);

const AdminLayout = () => (
  <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

const UserLayout = () => (
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

          {/* Dashboard - Accessible to all authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout><DashboardPage /></MainLayout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* User routes */}
          <Route path="/user" element={<UserLayout />}>
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
      </AuthProvider>
    </Router>
  );
}

export default App;
