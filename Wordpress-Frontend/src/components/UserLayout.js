import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const UserLayout = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Sidebar - 15% */}
            <div className="w-[15%] h-full bg-gray-800 text-white">
                <UserSidebar />
            </div>

            {/* Main Content - 85% */}
            <div className="w-[85%] h-full flex flex-col bg-gray-100 dark:bg-gray-900">
                {/* Header */}
                <UserHeader />

                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 dark:bg-gray-800 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <UserFooter />
            </div>
        </div>
    );
};

export default UserLayout;
