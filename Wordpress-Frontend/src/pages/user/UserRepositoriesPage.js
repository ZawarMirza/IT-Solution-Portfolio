import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

const UserRepositoriesPage = () => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockRepositories = [
          {
            id: 1,
            name: 'react-ecommerce',
            description: 'A full-featured e-commerce application built with React and Node.js',
            language: 'TypeScript',
            stars: 128,
            forks: 42,
            updatedAt: '2023-10-15',
            isPrivate: false
          },
          {
            id: 2,
            name: 'node-auth-service',
            description: 'JWT authentication service with role-based access control',
            language: 'JavaScript',
            stars: 87,
            forks: 23,
            updatedAt: '2023-11-05',
            isPrivate: false
          },
          {
            id: 3,
            name: 'portfolio-2023',
            description: 'My personal portfolio website',
            language: 'JavaScript',
            stars: 15,
            forks: 3,
            updatedAt: '2023-09-20',
            isPrivate: true
          }
        ];
        
        setRepositories(mockRepositories);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to load repositories. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteRepository = async (id) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setRepositories(repositories.filter(repo => repo.id !== id));
      } catch (err) {
        console.error('Error deleting repository:', err);
        setError('Failed to delete repository.');
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">My Repositories</h1>
            <p className="text-gray-500">Manage your code repositories</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search repositories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link
              to="/repositories/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Repository
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredRepos.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredRepos.map((repo) => (
                <li key={repo.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-indigo-600 truncate">
                          {repo.name}
                        </h3>
                        {repo.isPrivate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{repo.description}</p>
                      <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-1 ${
                            repo.language === 'TypeScript' ? 'bg-blue-500' : 
                            repo.language === 'JavaScript' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></span>
                          {repo.language}
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                          {repo.stars}
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {repo.forks}
                        </span>
                        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex space-x-3">
                      <Link
                        to={`/repositories/${repo.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                      <Link
                        to={`/repositories/${repo.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteRepository(repo.id)}
                        className="text-sm text-red-600 hover:text-red-900"
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No repositories match your search.' : 'Get started by creating a new repository.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/repositories/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Repository
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRepositoriesPage;
