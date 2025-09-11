import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import axios from 'axios';

const UserRepositoriesPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch repositories from API
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await axios.get('http://localhost:5119/api/Repositories');
        
        // Transform API data to match frontend structure
        const transformedRepositories = response.data.map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          domain: repo.domain,
          category: repo.category,
          gitHubUrl: repo.gitHubUrl,
          downloadUrl: repo.downloadUrl,
          documentPreviewUrl: repo.documentPreviewUrl,
          licenseType: repo.licenseType,
          version: repo.version,
          technologies: JSON.parse(repo.technologies || '[]'),
          accessLevel: repo.accessLevel,
          stars: repo.stars,
          forks: repo.forks,
          downloads: repo.downloads,
          lastUpdated: repo.lastUpdated,
          status: repo.status
        }));

        // If no data from API, use fallback mock data
        if (transformedRepositories.length === 0) {
          const mockRepositories = [
            {
              id: 1,
              name: 'react-ecommerce',
              description: 'A full-featured e-commerce application built with React and Node.js',
              domain: 'Web Development',
              category: 'Free',
              gitHubUrl: 'https://github.com/example/react-ecommerce',
              downloadUrl: 'https://github.com/example/react-ecommerce/archive/main.zip',
              documentPreviewUrl: 'https://github.com/example/react-ecommerce/blob/main/README.md',
              licenseType: 'MIT',
              version: '2.1.0',
              technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
              accessLevel: 'public',
              stars: 128,
              forks: 42,
              downloads: 2450,
              lastUpdated: '2023-10-15',
              status: 'active'
            }
          ];
          setRepositories(mockRepositories);
        } else {
          setRepositories(transformedRepositories);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        // Fallback to mock data on error
        const mockRepositories = [
          {
            id: 1,
            name: 'react-ecommerce',
            description: 'A full-featured e-commerce application built with React and Node.js',
            domain: 'Web Development',
            category: 'Free',
            gitHubUrl: 'https://github.com/example/react-ecommerce',
            downloadUrl: 'https://github.com/example/react-ecommerce/archive/main.zip',
            documentPreviewUrl: 'https://github.com/example/react-ecommerce/blob/main/README.md',
            licenseType: 'MIT',
            version: '2.1.0',
            technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
            accessLevel: 'public',
            stars: 128,
            forks: 42,
            downloads: 2450,
            lastUpdated: '2023-10-15',
            status: 'active'
          }
        ];
        setRepositories(mockRepositories);
        setError('Using offline data. Backend connection failed.');
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Get unique domains and categories for filter dropdowns
  const domains = ['All', ...new Set(repositories.map(repo => repo.domain))];
  const categories = ['All', 'Free', 'Premium'];

  // Access control based on user role
  const hasAccess = (repo) => {
    switch (repo.accessLevel) {
      case 'public':
        return true;
      case 'admin':
        return isAdmin();
      case 'premium':
        return isAdmin() || isAuthenticated();
      default:
        return false;
    }
  };

  // Filter repositories based on search and filters
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDomain = selectedDomain === 'All' || repo.domain === selectedDomain;
    const matchesCategory = selectedCategory === 'All' || repo.category === selectedCategory;
    
    return matchesSearch && matchesDomain && matchesCategory;
  });

  const handleDownload = async (repository) => {
    if (!isAuthenticated()) {
      alert('Please login to download repositories.');
      return;
    }
    
    try {
      // Increment download count via API
      await axios.post(`http://localhost:5119/api/Repositories/${repository.id}/download`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setRepositories(repositories.map(repo => 
        repo.id === repository.id 
          ? { ...repo, downloads: repo.downloads + 1 }
          : repo
      ));
      
      // Open download
      if (repository.downloadUrl) {
        window.open(repository.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error tracking download:', err);
      // Still allow download even if tracking fails
      if (repository.downloadUrl) {
        window.open(repository.downloadUrl, '_blank');
      }
    }
  };

  const handlePreview = (previewUrl, type = 'document') => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getCategoryBadge = (category) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (category) {
      case 'Free':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Premium':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
          <p className="mt-2 text-gray-600">
            Explore our collection of open-source projects and premium solutions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Repositories
              </label>
              <input
                type="text"
                placeholder="Search by name, description, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Domain Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map(repo => (
            <div key={repo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{repo.name}</h3>
                    <span className={getCategoryBadge(repo.category)}>
                      {repo.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {repo.description}
                </p>

                {/* Technologies */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {repo.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                    {repo.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{repo.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {repo.stars}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {repo.forks}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {repo.downloads}
                    </span>
                  </div>
                  <span className="text-xs">
                    v{repo.version}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {hasAccess(repo) ? (
                    <>
                      {repo.gitHubUrl && (
                        <button
                          onClick={() => handlePreview(repo.gitHubUrl, 'github')}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          View Code
                        </button>
                      )}
                      {repo.downloadUrl && (
                        <button
                          onClick={() => handleDownload(repo)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Download
                        </button>
                      )}
                      {repo.documentPreviewUrl && (
                        <button
                          onClick={() => handlePreview(repo.documentPreviewUrl, 'document')}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Docs
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-500">
                        {repo.category === 'Premium' ? 'Premium Access Required' : 'Login Required'}
                      </span>
                      <Link
                        to="/login"
                        className="block mt-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Login to Access
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredRepositories.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRepositoriesPage;
