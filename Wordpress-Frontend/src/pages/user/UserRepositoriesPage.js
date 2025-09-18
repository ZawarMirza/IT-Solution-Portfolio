import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import axios from 'axios';
import { FaGithub, FaStar, FaRegStar, FaDownload, FaComment, FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserRepositoriesPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('repositories');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeRepoId, setActiveRepoId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Fetch repositories from API - only get admin-uploaded repositories
  const fetchRepositories = async () => {
    const API_URL = 'http://localhost:5119/api/repositories';
    
    try {
      console.log('Fetching repositories from:', API_URL);
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(API_URL, { 
          timeout: 5000, // 5 second timeout
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log('API Response:', response.status, response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format: Expected an array of repositories');
        }
        
        // Filter for public/free repositories
        const publicRepos = response.data.filter(repo => {
          const isPublic = (repo.accessLevel === 'public' || repo.category === 'Free');
          console.log(`Repo ${repo.name || 'unnamed'}:`, { 
            uploadedBy: repo.uploadedBy, 
            accessLevel: repo.accessLevel,
            category: repo.category,
            isPublic
          });
          return isPublic;
        });
        
        console.log(`Found ${publicRepos.length} public repositories`);
        
        if (publicRepos.length > 0) {
          // Transform and sort the repositories
          const transformedRepositories = publicRepos.map(repo => ({
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
        technologies: typeof repo.technologies === 'string' 
          ? JSON.parse(repo.technologies || '[]') 
          : (repo.technologies || []),
        accessLevel: repo.accessLevel,
        stars: repo.stars || 0,
        forks: repo.forks || 0,
        downloads: repo.downloads || 0,
        rating: repo.rating || 0,
        userRating: 0, // Will be populated if user is logged in
        comments: repo.comments || [],
        lastUpdated: repo.lastUpdated || new Date().toISOString(),
        status: repo.status || 'active'
          }));
          
          // Sort by most recent first
          transformedRepositories.sort((a, b) => 
            new Date(b.lastUpdated) - new Date(a.lastUpdated)
          );
          
          setRepositories(transformedRepositories);
          return transformedRepositories;
        }
        
        // If no admin repos found, show the mock data
        throw new Error('No admin repositories found');
        
      } catch (apiError) {
        console.warn('Using fallback data due to API error:', apiError);
        throw apiError; // This will be caught by the outer catch block
      }
    } catch (err) {
      console.error('Error fetching repositories:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to load repositories. Using offline data.';
      setError(`Error: ${errorMessage}. Using offline data.`);
      
      // Fallback mock data for admin repositories
      const mockRepositories = [
        {
          id: 1,
          name: 'admin-ecommerce',
          description: 'Admin-uploaded e-commerce application built with React and Node.js',
          domain: 'Web Development',
          category: 'Free',
          gitHubUrl: 'https://github.com/example/admin-ecommerce',
          downloadUrl: 'https://github.com/example/admin-ecommerce/archive/main.zip',
          documentPreviewUrl: 'https://github.com/example/admin-ecommerce/blob/main/README.md',
          licenseType: 'MIT',
          version: '1.0.0',
          technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
          accessLevel: 'public',
          stars: 150,
          forks: 35,
          downloads: 1200,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          comments: [],
          uploadedBy: 'admin'  // Mark as admin-uploaded
        },
        {
          id: 2,
          name: 'admin-dashboard',
          description: 'Admin dashboard template with analytics and user management',
          domain: 'Web Development',
          category: 'Free',
          gitHubUrl: 'https://github.com/example/admin-dashboard',
          downloadUrl: 'https://github.com/example/admin-dashboard/archive/main.zip',
          documentPreviewUrl: 'https://github.com/example/admin-dashboard/blob/main/README.md',
          licenseType: 'MIT',
          version: '1.2.0',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
          accessLevel: 'public',
          stars: 230,
          forks: 78,
          downloads: 1850,
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          status: 'active',
          comments: [],
          uploadedBy: 'admin'  // Mark as admin-uploaded
        }
      ];
      
      setRepositories(mockRepositories);
      return mockRepositories;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Get unique domains and categories for filter dropdowns
  const domains = useMemo(() => {
    const domainSet = new Set();
    
    // Extract and clean up domains from repositories
    repositories.forEach(repo => {
      if (repo.domain && repo.domain.trim() !== '') {
        const domain = repo.domain.trim();
        if (domain !== 'undefined' && domain !== 'null') {
          domainSet.add(domain);
        }
      }
    });
    
    // Convert to array and sort alphabetically
    const uniqueDomains = Array.from(domainSet).sort();
    
    // Add 'All' option at the beginning
    return ['All', ...uniqueDomains];
  }, [repositories]);
  
  // Categories filter options
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

  // Handle preview
  const handlePreview = (url, type) => {
    if (type === 'github') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // For documents, open in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter repositories based on search and filters
  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const matchesSearch = searchTerm === '' || 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.technologies || []).some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesDomain = selectedDomain === 'All' || repo.domain === selectedDomain;
      const matchesCategory = selectedCategory === 'All' || repo.category === selectedCategory;
      
      return matchesSearch && matchesDomain && matchesCategory;
    });
  }, [repositories, searchTerm, selectedDomain, selectedCategory]);

  // Handle download
  const handleDownload = async (repo) => {
    if (!isAuthenticated) {
      toast.info('Please log in to download');
      return;
    }
    
    try {
      // Increment download count
      await axios.post(`/api/repositories/${repo.id}/download`);
      
      // If it's a direct file download
      if (repo.downloadUrl) {
        const link = document.createElement('a');
        link.href = repo.downloadUrl;
        link.download = repo.downloadUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (repo.gitHubUrl) {
        // Redirect to GitHub
        window.open(repo.gitHubUrl, '_blank');
      }
      
      // Update local state
      setRepositories(prev => prev.map(r => 
        r.id === repo.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
      ));
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to start download. Please try again.');
    }
  };

  // Handle rating
  const handleRate = async (repoId, newRating) => {
    if (!isAuthenticated) {
      toast.info('Please log in to rate repositories');
      return;
    }

    try {
      // Update local state optimistically
      setRepositories(repos =>
        repos.map(repo => {
          if (repo.id === repoId) {
            return {
              ...repo,
              rating: newRating,
              userRating: newRating,
              ratingCount: repo.ratingCount ? repo.ratingCount + 1 : 1,
            };
          }
          return repo;
        })
      );

      // Update the rating on the server
      await axios.post(`/api/repositories/${repoId}/rate`, { rating: newRating });
      toast.success('Rating submitted successfully');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      // Revert optimistic update
      setRepositories(repos =>
        repos.map(repo => {
          if (repo.id === repoId) {
            return {
              ...repo,
              rating: repo.rating,
              userRating: repo.userRating,
            };
          }
          return repo;
        })
      );
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e, repoId) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Please log in to comment');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      const response = await axios.post(`/api/repositories/${repoId}/comments`, {
        content: comment,
        userId: user.id,
        userName: user.name || 'Anonymous'
      });
      
      // Update local state
      setRepositories(prev => prev.map(repo => 
        repo.id === repoId 
          ? { 
              ...repo, 
              comments: [...(repo.comments || []), response.data]
            } 
          : repo
      ));
      
      setComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment submission failed:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  // Toggle comments section
  const toggleComments = (repoId) => {
    setActiveRepoId(activeRepoId === repoId ? null : repoId);
    setShowComments(!showComments);
  };

  // Tab navigation
  const renderTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('repositories')}
          className={`${activeTab === 'repositories' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Repositories
        </button>
        <button
          onClick={() => setActiveTab('publications')}
          className={`${activeTab === 'publications' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Publications
        </button>
      </nav>
    </div>
  );

  // Render star rating
  const renderStars = (rating, repoId, interactive = false) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && handleRate(repoId, star)}
          className={`${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'hover:text-yellow-500' : ''}`}
          disabled={!interactive}
        >
          {star <= Math.round(rating) ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
      <span className="ml-1 text-sm text-gray-500">
        ({rating ? rating.toFixed(1) : '0.0'})
      </span>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchRepositories}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (filteredRepositories.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepositories.map((repo) => (
          <div key={repo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {repo.gitHubUrl ? (
                      <a
                        href={repo.gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {repo.name}
                        <FaGithub className="inline-block ml-2 text-gray-500" />
                      </a>
                    ) : (
                      repo.name
                    )}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      {repo.domain}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {repo.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center text-yellow-400">
                    {renderStars(repo.rating || 0, repo.id, false)}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{repo.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {repo.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setActiveRepoId(repo.id === activeRepoId ? null : repo.id);
                      setShowComments(repo.id !== activeRepoId || !showComments);
                    }}
                    className={`flex items-center text-sm ${showComments && repo.id === activeRepoId ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FaComment className="mr-1" /> 
                    {repo.comments?.length || 0} Comments
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  {repo.licenseType && `License: ${repo.licenseType} ${repo.version}`}
                </div>
              </div>
              
              {/* Comments Section */}
              {activeRepoId === repo.id && showComments && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
                  
                  {/* Comment Form */}
                  {isAuthenticated ? (
                    <form onSubmit={(e) => handleCommentSubmit(e, repo.id)} className="mb-4">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <textarea
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-4 text-sm text-gray-600">
                      <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to leave a comment.
                    </div>
                  )}
                  
                  {/* Comments List */}
                  <div className="space-y-4">
                    {repo.comments?.length > 0 && repo.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{comment.userName || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">{comment.content}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                            </svg>
                            {comment.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
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
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Open Source Repositories</h1>
        <p className="text-gray-600">Browse and download our open source projects and resources</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ml-2 p-1 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'repositories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('repositories')}
          >
            Repositories
          </button>
          <button
            className={`${
              activeTab === 'favorites'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserRepositoriesPage;
