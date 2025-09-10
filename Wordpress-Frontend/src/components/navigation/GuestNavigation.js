import React from 'react';
import { Link } from 'react-router-dom';

const GuestNavigation = () => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link
        to="/"
        className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Home
      </Link>
      <Link
        to="/products"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Products
      </Link>
      <Link
        to="/about"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        About
      </Link>
    </div>
  );
};

export default GuestNavigation;
