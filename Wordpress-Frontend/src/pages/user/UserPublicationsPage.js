import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

const UserPublicationsPage = () => {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockPublications = [
          {
            id: 1,
            title: 'Advanced React Patterns',
            description: 'A comprehensive guide to advanced React patterns and best practices.',
            status: 'published',
            downloads: 245,
            updatedAt: '2023-10-20',
          },
          {
            id: 2,
            title: 'State Management in 2023',
            description: 'Comparing different state management solutions for modern web apps.',
            status: 'draft',
            downloads: 0,
            updatedAt: '2023-11-05',
          }
        ];
        
        setPublications(mockPublications);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching publications:', err);
        setError('Failed to load publications. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const deletePublication = async (id) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPublications(publications.filter(pub => pub.id !== id));
      } catch (err) {
        console.error('Error deleting publication:', err);
        setError('Failed to delete publication.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Publications</h1>
            <p className="text-gray-500">Manage your published works and drafts</p>
          </div>
          <Link
            to="/publications/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Publication
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {publications.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {publications.map((pub) => (
                <li key={pub.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-indigo-600">{pub.title}</h3>
                        {getStatusBadge(pub.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{pub.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Updated on {new Date(pub.updatedAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{pub.downloads} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/publications/${pub.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deletePublication(pub.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No publications</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new publication.</p>
              <div className="mt-6">
                <Link
                  to="/publications/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Publication
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPublicationsPage;
