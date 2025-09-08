import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaBox, FaGlobe } from 'react-icons/fa';

const AdminSidebar = () => {
    const location = useLocation();

    return (
        <div className="bg-gray-800 text-white h-full w-64 fixed top-0 left-0 pt-16">
            <div className="px-6 pt-4 pb-8 border-b border-gray-700">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold">IT Solutions</Link>
                </div>
            </div>
            <nav className="mt-10 px-6">
                <ul>
                    <li className="mb-4">
                        <Link to="/admin/dashboard" className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${location.pathname === '/admin/dashboard' ? 'bg-gray-700' : ''}`}>
                            <FaTachometerAlt className="mr-3" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/admin/users" className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${location.pathname === '/admin/users' ? 'bg-gray-700' : ''}`}>
                            <FaUsers className="mr-3" />
                            <span>Users</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/admin/all-products" className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${location.pathname === '/admin/all-products' ? 'bg-gray-700' : ''}`}>
                            <FaBox className="mr-3" />
                            <span>Products</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/admin/domains" className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${location.pathname === '/admin/domains' ? 'bg-gray-700' : ''}`}>
                            <FaGlobe className="mr-3" />
                            <span>Domains</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
