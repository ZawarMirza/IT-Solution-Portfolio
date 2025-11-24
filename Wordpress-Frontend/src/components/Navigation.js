import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context";
import GuestNavigation from './navigation/GuestNavigation';
import AdminNavigation from './navigation/AdminNavigation';
import UserNavigation from './navigation/UserNavigation';
import GlobalSearch from './GlobalSearch';

const Navigation = () => {
  const { user, isAdmin, isUser, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const logoSrc = `${process.env.PUBLIC_URL || ''}/assets/logo.jpeg`;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <img
                  src={logoSrc}
                  alt="IT Solution Portfolio"
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Link>
            </div>
            
            {/* Desktop Navigation - Only show for non-admin users */}
            {isGuest() && <GuestNavigation />}
            {user && isUser() && !isAdmin() && <UserNavigation />}
          </div>
          
          {/* Right Side: Search, User Info, and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Global Search - Hidden on very small screens, visible from sm */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 text-sm">
                    Welcome, {user.firstName || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <GlobalSearch />
            </div>

            {/* Mobile Navigation Links */}
            {isGuest() && (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Products
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </>
            )}

            {user && isUser() && !isAdmin() && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/user/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/user/publications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Publications
                </Link>
                <Link
                  to="/user/repositories"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Repositories
                </Link>
                <Link
                  to="/user/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Settings
                </Link>
              </>
            )}

            {/* Mobile User Actions */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">
                      {user.firstName || user.email}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
