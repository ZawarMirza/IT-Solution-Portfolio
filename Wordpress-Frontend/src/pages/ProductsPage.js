import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context';
import api from '../utils/axiosConfig';
import { FaGithub, FaDownload, FaEnvelope, FaTag, FaFileAlt, FaVideo, FaImage, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('repositories'); // 'repositories' or 'publications'
  
  // Common state
  const [domains, setDomains] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Repositories state
  const [repositories, setRepositories] = useState([]);
  const [selectedDomainRepo, setSelectedDomainRepo] = useState('All');
  
  // Publications state
  const [publications, setPublications] = useState([]);
  const [selectedDomainPub, setSelectedDomainPub] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await api.get('/domains');
        const domainNames = response.data.map(domain => domain.name);
        setDomains(['All', ...domainNames]);
      } catch (err) {
        console.error('Error fetching domains:', err);
      }
    };
    fetchDomains();
  }, []);

  // Fetch repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/repositories');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        // Transform repositories
        const transformedRepos = response.data.map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          domain: repo.domain,
          category: repo.category || 'Free',
          gitHubUrl: repo.gitHubUrl,
          downloadUrl: repo.downloadUrl,
          documentPreviewUrl: repo.documentPreviewUrl,
          thumbnailUrl: repo.thumbnailUrl,
          licenseType: repo.licenseType,
          version: repo.version,
          technologies: typeof repo.technologies === 'string' 
            ? JSON.parse(repo.technologies || '[]') 
            : (repo.technologies || []),
          accessLevel: repo.accessLevel || 'public',
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          downloads: repo.downloads || 0,
        }));
        
        setRepositories(transformedRepos);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to load repositories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'repositories') {
      fetchRepositories();
    }
  }, [activeTab]);

  // Fetch publications
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/Publications');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        // Transform publications
        const transformedPubs = response.data.map(pub => ({
          id: pub.id,
          title: pub.title,
          authors: typeof pub.authors === 'string' ? JSON.parse(pub.authors || '[]') : (pub.authors || []),
          domain: pub.domain,
          abstract: pub.abstract,
          thumbnailUrl: pub.thumbnailUrl,
          documentPreviewUrl: pub.documentPreviewUrl,
          videoPreviewUrl: pub.videoPreviewUrl,
          downloadUrl: pub.downloadUrl,
          publishedDate: pub.publishedDate,
          downloads: pub.downloads || 0,
          keywords: typeof pub.keywords === 'string' ? JSON.parse(pub.keywords || '[]') : (pub.keywords || []),
          status: pub.status
        }));
        
        setPublications(transformedPubs);
      } catch (err) {
        console.error('Error fetching publications:', err);
        setError('Failed to load publications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'publications') {
      fetchPublications();
    }
  }, [activeTab]);

  // Filter repositories by domain
  const filteredRepositories = useMemo(() => {
    if (selectedDomainRepo === 'All') {
      return repositories;
    }
    return repositories.filter(repo => repo.domain === selectedDomainRepo);
  }, [repositories, selectedDomainRepo]);

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    return publications
      .filter(publication => {
        // Domain filter
        const matchesDomain = selectedDomainPub === 'All' || publication.domain === selectedDomainPub;
        
        // Search filter
        const matchesSearch = 
          searchTerm === '' ||
          publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publication.authors.some(author => 
            author.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          publication.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          publication.abstract.toLowerCase().includes(searchTerm.toLowerCase());
          
        return matchesDomain && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedDate) - new Date(a.publishedDate);
        } else if (sortBy === 'popular') {
          return b.downloads - a.downloads;
        }
        return 0;
      });
  }, [publications, selectedDomainPub, searchTerm, sortBy]);

  // Handle repository download
  const handleRepoDownload = (repo) => {
    if (repo.category === 'Free' && repo.gitHubUrl) {
      window.open(repo.gitHubUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening GitHub repository...');
    } else if (repo.category === 'Premium') {
      handleContactAdmin(repo);
    }
  };

  // Handle contact admin
  const handleContactAdmin = (repo) => {
    const subject = encodeURIComponent(`Request for Premium Repository: ${repo.name}`);
    const body = encodeURIComponent(
      `Hello Admin,\n\nI would like to request access to the following premium repository:\n\n` +
      `Repository: ${repo.name}\n` +
      `Description: ${repo.description}\n` +
      `Domain: ${repo.domain}\n` +
      `Version: ${repo.version || 'N/A'}\n\n` +
      `Please provide access or more information.\n\nThank you!`
    );
    
    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`;
    toast.info('Opening email client to contact admin...');
  };

  // Handle publication download
  const handlePubDownload = async (publication) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to download publications');
      return;
    }
    
    if (!publication.downloadUrl) {
      toast.error('Download URL not available');
      return;
    }
    
    try {
      // Increment download count
      await api.put(`/Publications/${publication.id}/download`);
      
      // Open download link
      window.open(publication.downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success('Download started!');
    } catch (err) {
      console.error('Error downloading publication:', err);
      toast.error('Failed to start download. Please try again.');
    }
  };

  // Get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5119${url}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Banner Section */}
      <div className="relative h-80 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-purple-800/30 to-transparent"></div>
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Products Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in">
            Research & Resources
          </h1>
          <p className="text-xl text-indigo-200 max-w-3xl mt-4">
            Explore our comprehensive collection of research publications and open-source repositories across various domains.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 sticky top-0 z-20 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('repositories')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'repositories'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaGithub className="inline mr-2" />
              Repositories
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'publications'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Research & Publications
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Repositories Tab */}
        {activeTab === 'repositories' && !loading && (
          <div>
            {/* Domain Filter */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <FaFilter className="mr-2 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter by Domain</h3>
              </div>
              <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain}
                    onClick={() => setSelectedDomainRepo(domain)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedDomainRepo === domain
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

            {/* Repositories Grid */}
            {filteredRepositories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No repositories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Thumbnail */}
                    {repo.thumbnailUrl && (
                      <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={getImageUrl(repo.thumbnailUrl)}
                          alt={repo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Title and Category */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex-1">
                          {repo.name}
                        </h3>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            repo.category === 'Free'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {repo.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {repo.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {repo.technologies && repo.technologies.length > 0 && (
                          <>
                            {repo.technologies.slice(0, 3).map((tech, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              >
                                <FaTag className="mr-1" />
                                {tech}
                              </span>
                            ))}
                          </>
                        )}
                      </div>

                      {/* License and Version */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {repo.licenseType && (
                          <span>License: {repo.licenseType}</span>
                        )}
                        {repo.version && (
                          <span>v{repo.version}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {repo.category === 'Free' ? (
                          <button
                            onClick={() => handleRepoDownload(repo)}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition duration-200"
                          >
                            <FaGithub />
                            Download from GitHub
                          </button>
                        ) : (
                          <button
                            onClick={() => handleContactAdmin(repo)}
                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded transition duration-200"
                          >
                            <FaEnvelope />
                            Contact Admin
                          </button>
                        )}
                        {repo.documentPreviewUrl && (
                          <button
                            onClick={() => window.open(getImageUrl(repo.documentPreviewUrl), '_blank')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition duration-200"
                            title="Preview Document"
                          >
                            <FaFileAlt />
                          </button>
                        )}
      </div>

                      {/* Stats */}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>⭐ {repo.stars || 0}</span>
                        <span>🍴 {repo.forks || 0}</span>
                        <span>⬇️ {repo.downloads || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
        )}

        {/* Publications Tab */}
        {activeTab === 'publications' && !loading && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, keyword, or abstract..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
            </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <FaFilter className="mr-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Domain:</span>
                  <select
                    value={selectedDomainPub}
                    onChange={(e) => setSelectedDomainPub(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Publications Grid */}
            {filteredPublications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No publications found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublications.map((pub) => (
                  <div
                    key={pub.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Thumbnail/Preview */}
                    <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                      {pub.thumbnailUrl ? (
                        <img
                          src={getImageUrl(pub.thumbnailUrl)}
                          alt={pub.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : pub.videoPreviewUrl ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaVideo className="text-4xl text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaFileAlt className="text-4xl text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                          {pub.domain}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                        {pub.title}
                      </h3>

                      {/* Authors */}
                      {pub.authors && pub.authors.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium">Authors:</span>{' '}
                          {pub.authors.slice(0, 3).join(', ')}
                          {pub.authors.length > 3 && ' et al.'}
                        </p>
                      )}

                      {/* Abstract */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {pub.abstract}
                      </p>

                      {/* Keywords */}
                      {pub.keywords && pub.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pub.keywords.slice(0, 5).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              <FaTag className="mr-1" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handlePubDownload(pub)}
                          disabled={!isAuthenticated()}
                          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition duration-200 ${
                            isAuthenticated()
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                          }`}
                        >
                          <FaDownload />
                          {isAuthenticated() ? 'Download' : 'Login to Download'}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {pub.downloads || 0} downloads
                        </span>
              </div>

                      {/* Published Date */}
                      {pub.publishedDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Published: {new Date(pub.publishedDate).toLocaleDateString()}
                        </p>
          )}
        </div>
      </div>
                ))}
              </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
