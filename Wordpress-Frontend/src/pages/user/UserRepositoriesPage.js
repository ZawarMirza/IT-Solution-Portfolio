import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

const UserRepositoriesPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data with Free/Premium categories and domains
        const mockRepositories = [
          {
            id: 1,
            name: 'react-ecommerce',
            description: 'A full-featured e-commerce application built with React and Node.js',
            language: 'TypeScript',
            stars: 128,
            forks: 42,
            updatedAt: '2023-10-15',
            isPrivate: false,
            category: 'Free',
            domain: 'E-commerce',
            githubUrl: 'https://github.com/yourusername/react-ecommerce',
            downloadUrl: 'https://github.com/yourusername/react-ecommerce/archive/refs/heads/main.zip',
            license: 'MIT',
            version: '2.1.0',
            documentPreview: 'https://github.com/yourusername/react-ecommerce/blob/main/README.md',
            tags: ['Free', 'React', 'E-commerce', 'TypeScript'],
            accessLevel: 'public'
          },
          {
            id: 2,
            name: 'node-auth-service',
            description: 'JWT authentication service with role-based access control',
            language: 'JavaScript',
            stars: 87,
            forks: 23,
            updatedAt: '2023-11-05',
            isPrivate: false,
            category: 'Free',
            domain: 'Authentication',
            githubUrl: 'https://github.com/yourusername/node-auth-service',
            downloadUrl: 'https://github.com/yourusername/node-auth-service/archive/refs/heads/main.zip',
            license: 'Apache-2.0',
            version: '1.5.2',
            documentPreview: 'https://github.com/yourusername/node-auth-service/blob/main/README.md',
            tags: ['Free', 'Node.js', 'Authentication', 'JWT'],
            accessLevel: 'public'
          },
          {
            id: 3,
            name: 'portfolio-2023',
            description: 'My personal portfolio website with advanced features',
            language: 'JavaScript',
            stars: 15,
            forks: 3,
            updatedAt: '2023-09-20',
            isPrivate: true,
            category: 'Premium',
            domain: 'Portfolio',
            githubUrl: null,
            downloadUrl: null,
            license: 'Commercial',
            version: '3.0.1',
            documentPreview: '/docs/portfolio-preview.pdf',
            tags: ['Premium', 'Portfolio', 'React', 'Commercial'],
            accessLevel: 'admin_only'
          },
          {
            id: 4,
            name: 'enterprise-crm',
            description: 'Advanced CRM system with analytics and reporting',
            language: 'TypeScript',
            stars: 45,
            forks: 12,
            updatedAt: '2023-11-20',
            isPrivate: true,
            category: 'Premium',
            domain: 'Business',
            githubUrl: null,
            downloadUrl: null,
            license: 'Proprietary',
            version: '4.2.0',
            documentPreview: '/docs/crm-overview.pdf',
            tags: ['Premium', 'CRM', 'Enterprise', 'Analytics'],
            accessLevel: 'premium_users'
          },
          {
            id: 5,
            name: 'vue-dashboard',
            description: 'Modern dashboard template built with Vue.js',
            language: 'Vue',
            stars: 92,
            forks: 28,
            updatedAt: '2023-10-30',
            isPrivate: false,
            category: 'Free',
            domain: 'Dashboard',
            githubUrl: 'https://github.com/yourusername/vue-dashboard',
            downloadUrl: 'https://github.com/yourusername/vue-dashboard/archive/refs/heads/main.zip',
            license: 'MIT',
            version: '1.8.3',
            documentPreview: 'https://github.com/yourusername/vue-dashboard/blob/main/README.md',
            tags: ['Free', 'Vue.js', 'Dashboard', 'Template'],
            accessLevel: 'public'
          },
          {
            id: 6,
            name: 'ai-chatbot-premium',
            description: 'Advanced AI chatbot with natural language processing',
            language: 'Python',
            stars: 67,
            forks: 15,
            updatedAt: '2023-12-01',
            isPrivate: true,
            category: 'Premium',
            domain: 'AI/ML',
            githubUrl: null,
            downloadUrl: null,
            license: 'Commercial',
            version: '2.3.1',
            documentPreview: '/docs/ai-chatbot-demo.pdf',
            tags: ['Premium', 'AI', 'Chatbot', 'NLP', 'Python'],
            accessLevel: 'premium_users'
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

  // Get unique domains for filter dropdown
  const domains = ['All', ...new Set(repositories.map(repo => repo.domain))];
  
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

  // Filter and sort repositories
  const filteredRepos = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDomain = selectedDomain === 'All' || repo.domain === selectedDomain;
      const matchesCategory = selectedCategory === 'All' || repo.category === selectedCategory;
      const hasUserAccess = hasAccess(repo);
      return matchesSearch && matchesDomain && matchesCategory && hasUserAccess;
    })
    .sort((a, b) => {
      // Sort by domain first, then by name
      if (a.domain !== b.domain) {
        return a.domain.localeCompare(b.domain);
      }
      return a.name.localeCompare(b.name);
    });

  const handleDownload = (repo) => {
    if (repo.downloadUrl) {
      window.open(repo.downloadUrl, '_blank');
    }
  };

  const handleContactAdmin = () => {
    // You can implement email or contact form here
    alert('Please contact admin at admin@example.com for premium repository access.');
  };

  const handlePreviewDocument = (repo) => {
    if (repo.documentPreview) {
      window.open(repo.documentPreview, '_blank');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Repository Assets</h1>
            <p className="text-gray-500">Download free repositories or contact admin for premium access</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
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
          
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {domains.map(domain => (
              <option key={domain} value={domain}>Domain: {domain}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="All">Category: All</option>
            <option value="Free">Category: Free</option>
            <option value="Premium">Category: Premium</option>
          </select>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          repo.category === 'Free' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {repo.category}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {repo.domain}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{repo.description}</p>
                      
                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {repo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              tag === 'Free' ? 'bg-green-50 text-green-700 border border-green-200' :
                              tag === 'Premium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* License and Version */}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          📄 {repo.license} License
                        </span>
                        <span className="flex items-center">
                          🏷️ v{repo.version}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-1 ${
                            repo.language === 'TypeScript' ? 'bg-blue-500' : 
                            repo.language === 'JavaScript' ? 'bg-yellow-500' : 
                            repo.language === 'Vue' ? 'bg-green-500' :
                            repo.language === 'Python' ? 'bg-blue-600' : 'bg-gray-500'
                          }`}></span>
                          {repo.language}
                        </span>
                        <span className="flex items-center">
                          ⭐ {repo.stars}
                        </span>
                        <span className="flex items-center">
                          🍴 {repo.forks}
                        </span>
                        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col space-y-2">
                      {/* Document Preview Button */}
                      <button
                        onClick={() => handlePreviewDocument(repo)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Preview Docs
                      </button>

                      {repo.category === 'Free' ? (
                        <div className="flex flex-col space-y-2">
                          {repo.githubUrl && (
                            <a
                              href={repo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              View on GitHub
                            </a>
                          )}
                          <button
                            onClick={() => handleDownload(repo)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                            </svg>
                            Download ZIP
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleContactAdmin}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Admin
                        </button>
                      )}
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
