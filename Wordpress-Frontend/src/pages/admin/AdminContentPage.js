import React from 'react';
import { useAuth } from '../../context';

const AdminContentPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Content Overview</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Publications</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Repositories</span>
                  <span className="text-sm font-medium">567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Reviews</span>
                  <span className="text-sm font-medium">23</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-indigo-600 bg-white border border-indigo-100 rounded-md hover:bg-indigo-50">
                  <span>Add New Publication</span>
                  <span>+</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-indigo-600 bg-white border border-indigo-100 rounded-md hover:bg-indigo-50">
                  <span>Manage Categories</span>
                  <span>→</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-indigo-600 bg-white border border-indigo-100 rounded-md hover:bg-indigo-50">
                  <span>Review Submissions</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-4 space-y-3">
                <div className="text-sm">
                  <p className="font-medium">New publication submitted</p>
                  <p className="text-gray-500 text-xs">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Repository updated</p>
                  <p className="text-gray-500 text-xs">5 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">New comment on "React Patterns"</p>
                  <p className="text-gray-500 text-xs">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Table */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">All Content</h2>
              <div className="flex space-x-2">
                <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>Filter by type</option>
                  <option>Publications</option>
                  <option>Repositories</option>
                  <option>Comments</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search content..." 
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      React Best Practices
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Publication
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2 days ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</a>
                      <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                    </td>
                  </tr>
                  {/* More rows... */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
