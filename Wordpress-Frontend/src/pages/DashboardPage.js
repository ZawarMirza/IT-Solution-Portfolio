import React from 'react';
import { useAuth } from "../context";
import AdminDashboard from './dashboard/AdminDashboard';
import UserDashboard from './dashboard/UserDashboard';

const DashboardPage = () => {
  const { isAdmin, isUser } = useAuth();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isUser()) {
    return <UserDashboard />;
  }

  // Fallback for users with no specific role
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to Your Dashboard</h1>
        <div className="mt-4">
          <p className="text-gray-600">You don't have any specific dashboard assigned to your account.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
