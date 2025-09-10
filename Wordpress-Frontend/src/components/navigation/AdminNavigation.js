import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavigation = () => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link
        to="/admin"
        className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Dashboard
      </Link>
      <Link
        to="/admin/users"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Users
      </Link>
      <Link
        to="/admin/products"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Products
      </Link>
      <Link
        to="/admin/domains"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Domains
      </Link>
      <Link
        to="/admin/content"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Content
      </Link>
      <Link
        to="/admin/settings"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Settings
      </Link>
    </div>
  );
};

export default AdminNavigation;
