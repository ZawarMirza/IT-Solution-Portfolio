import React, { useState } from 'react';
import { useAuth } from '../../context';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'My Website',
    siteDescription: 'A platform for sharing knowledge',
    registrationEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement settings save
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                id="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                name="siteDescription"
                id="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="registrationEnabled"
                  name="registrationEnabled"
                  type="checkbox"
                  checked={settings.registrationEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="registrationEnabled" className="font-medium text-gray-700">
                  Enable User Registration
                </label>
                <p className="text-gray-500">Allow new users to register accounts</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-gray-500">Send email notifications for important events</p>
              </div>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="maintenanceMode"
                  name="maintenanceMode"
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-gray-500">Enable maintenance mode (only admins can access the site)</p>
              </div>
            </div>
            {settings.maintenanceMode && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Note:</span> When maintenance mode is enabled, regular users will see a maintenance page.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your site's configuration and preferences.</p>
          </div>
          
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'general'
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'users'
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  User Settings
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'maintenance'
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Maintenance
                </button>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {renderTabContent()}
                
                <div className="pt-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
