import React from 'react';
import { Link } from 'react-router-dom';

const UserNavigation = () => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link
        to="/dashboard"
        className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Dashboard
      </Link>
      <Link
        to="/user/profile"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Profile
      </Link>
      <Link
        to="/user/publications"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Publications
      </Link>
      <Link
        to="/user/repositories"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Repositories
      </Link>
      <Link
        to="/user/settings"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Settings
      </Link>
    </div>
  );
};

export default UserNavigation;
