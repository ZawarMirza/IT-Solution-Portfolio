import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

function UserSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const menuItems = [
    {
      name: 'Profile',
      path: '/user/profile',
      icon: '👤'
    },
    {
      name: 'Publications',
      path: '/user/publications',
      icon: '📚'
    },
    {
      name: 'Repositories',
      path: '/user/repositories',
      icon: '📁'
    },
    {
      name: 'Settings',
      path: '/user/settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="h-full bg-gray-800 text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">User Dashboard</h2>
        <p className="text-sm text-gray-300">Welcome, {user?.firstName || 'User'}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center px-4 py-2 mb-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <span className="mr-3">🏠</span>
          <span>View Website</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
        >
          <span className="mr-3">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default UserSidebar;
