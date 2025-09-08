import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// CSS moved to inline styles in index.html
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboardPage from './pages/UserDashboardPage';
import MainLayout from './components/MainLayout';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminProductsPage'; // Renamed to AdminProductsPage
import AdminDomainsPage from './pages/admin/AdminDomainsPage'; // Added for domain management
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Header and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        {/* User Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<UserDashboardPage />} />
        </Route>

        {/* Admin Dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="all-products" element={<AdminPostsPage />} />
          <Route path="domains" element={<AdminDomainsPage />} />
        </Route>

        {/* Standalone auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
