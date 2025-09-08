// src/components/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBasedRender from './RoleBasedRender';

function NavigationBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Portfolio</Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Home</Link>
              <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">About</Link>
              <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Products</Link>
              
              <RoleBasedRender allowedRoles={['Admin']}>
                <Link to="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Admin Dashboard</Link>
              </RoleBasedRender>
              
              <RoleBasedRender allowedRoles={['User', 'Admin']}>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">My Dashboard</Link>
              </RoleBasedRender>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <span className="text-sm">
                  Welcome, {user?.firstName || 'User'}!
                  {user?.roles?.includes('Admin') && ' (Admin)'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
              <span className="sr-only">Open main menu</span>
              {/* Menu icon */}
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;