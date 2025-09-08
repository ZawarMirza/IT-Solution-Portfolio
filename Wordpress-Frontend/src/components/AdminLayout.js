import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const AdminLayout = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Sidebar - 30% */}
            <div className="w-[15%] h-full bg-gray-800 text-white">
                <AdminSidebar />
            </div>

            {/* Main Content - 70% */}
            <div className="w-[85%] h-full flex flex-col bg-gray-100 dark:bg-gray-900">
                {/* Header */}
                <AdminHeader />

                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 dark:bg-gray-800 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <AdminFooter />
            </div>
        </div>
    );
};

export default AdminLayout;
