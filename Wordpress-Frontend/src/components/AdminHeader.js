import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear the admin token from localStorage
        localStorage.removeItem('adminToken');
        // Redirect to home page
        navigate('/');
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <div>
                {/* Add any header content here, like user profile, logout button, etc. */}
                <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
