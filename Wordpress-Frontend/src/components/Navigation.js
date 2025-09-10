import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context";
import GuestNavigation from './navigation/GuestNavigation';
import AdminNavigation from './navigation/AdminNavigation';
import UserNavigation from './navigation/UserNavigation';

const Navigation = () => {
  const { user, isAdmin, isUser, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Your Logo
              </Link>
            </div>
            
            {/* Role-based Navigation - Only show for non-admin users */}
            {isGuest() && <GuestNavigation />}
            {user && isUser() && !isAdmin() && <UserNavigation />}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user.firstName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
