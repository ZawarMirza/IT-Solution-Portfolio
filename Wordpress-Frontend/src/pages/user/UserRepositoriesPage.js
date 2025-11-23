import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import api from '../../utils/axiosConfig';
import { FaGithub, FaStar, FaRegStar, FaDownload, FaComment, FaEdit, FaEnvelope, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserRepositoriesPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [domains, setDomains] = useState([]); // All available domains from admin
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
  const [approvedRepos, setApprovedRepos] = useState(new Set());
  const [pendingRepos, setPendingRepos] = useState(new Set());

  // Fetch premium repository request status (approved and pending)
  const fetchApprovedAccess = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await api.get('/PremiumRepositoryRequests/my-requests');
      const approved = response.data
        .filter((req) => req.status === 'approved')
        .map((req) => req.repositoryId);
      // Only show pending if it hasn't been reviewed yet (to allow re-request after unapproval)
      // If a request was unapproved (has reviewedAt but status is pending/rejected), don't show as pending
      const pending = response.data
        .filter((req) => req.status === 'pending' && !req.reviewedAt)
        .map((req) => req.repositoryId);
      setApprovedRepos(new Set(approved));
      setPendingRepos(new Set(pending));
    } catch (err) {
      console.error('Error checking request status:', err);
    }
  };

  // Fetch domains from admin
  const fetchDomains = async () => {
    try {
      const response = await api.get('/domains');
      if (response.data && Array.isArray(response.data)) {
        const domainNames = response.data.map(d => d.name || d);
        setDomains(['All', ...domainNames]);
      }
    } catch (err) {
      console.warn('Failed to fetch domains:', err);
      // Use fallback domains from repositories
    }
  };

  // Fetch repositories from API
  const fetchRepositories = async () => {
    try {
      console.log('Fetching repositories...');
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/repositories', { 
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('API Response:', response.status, response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array of repositories');
      }
      
      // Filter repositories based on access level
      // For logged-in users: Show ALL repositories (free, premium, non-premium)
      const accessibleRepos = response.data.filter(repo => {
        // If user is authenticated, show all repositories
        if (isAuthenticated()) {
          // Show all: free, premium, and non-premium
          return true;
        }
        // If not authenticated (shouldn't happen on user dashboard, but just in case)
        // Show only non-premium (Free category but no GitHub URL)
        return repo.category === 'Free' && !repo.gitHubUrl;
      });
      
      // Transform repositories
      const transformedRepositories = accessibleRepos.map(repo => ({
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
        rating: repo.rating || 0,
        userRating: 0,
        comments: repo.comments || [],
        lastUpdated: repo.lastUpdated || repo.createdAt || new Date().toISOString(),
        status: repo.status || 'active',
        createdBy: repo.createdBy
      }));
      
      // Sort by most recent first
      transformedRepositories.sort((a, b) => 
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
      
      setRepositories(transformedRepositories);
      
      // Extract unique domains from repositories if domains API fails
      if (domains.length <= 1) {
        const repoDomains = [...new Set(transformedRepositories.map(r => r.domain).filter(Boolean))];
        setDomains(['All', ...repoDomains.sort()]);
      }
      
      return transformedRepositories;
    } catch (err) {
      console.error('Error fetching repositories:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to load repositories.';
      setError(errorMessage);
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDomains();
    fetchRepositories();
    fetchApprovedAccess();
    
    // Refresh request status periodically to catch unapprovals
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        fetchApprovedAccess();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Handle download - Free items download from GitHub, Premium checks approved access
  const handleDownload = async (repo) => {
    // Premium items - check if user has approved access
    if (repo.category === 'Premium') {
      const hasAccess = approvedRepos.has(repo.id);
      
      if (hasAccess) {
        // User has approved access, allow download
        if (repo.downloadUrl) {
          window.open(repo.downloadUrl, '_blank', 'noopener,noreferrer');
          toast.success('Starting download...');
        } else if (repo.gitHubUrl) {
          window.open(repo.gitHubUrl, '_blank', 'noopener,noreferrer');
          toast.success('Opening GitHub repository...');
        } else {
          toast.error('Download URL not available for this repository');
        }
      } else {
        // No approved access, create request
        handleContactAdmin(repo);
      }
      return;
    }

    // Free items - check authentication
    if (!isAuthenticated()) {
      toast.info('Please log in to download free repositories');
      navigate('/login');
      return;
    }
    
    try {
      // If it's a direct file download
      if (repo.downloadUrl) {
        const link = document.createElement('a');
        link.href = repo.downloadUrl;
        link.download = repo.downloadUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (repo.gitHubUrl) {
        // Open GitHub repository
        window.open(repo.gitHubUrl, '_blank', 'noopener,noreferrer');
      }
      
      // Increment download count on server
      try {
        await api.put(`/repositories/${repo.id}/download`);
      } catch (err) {
        console.warn('Failed to update download count:', err);
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

  // Handle contact admin for premium items - create request
  const handleContactAdmin = async (repo) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to request premium repository access');
      return;
    }

    try {
      const response = await api.post('/PremiumRepositoryRequests', {
        repositoryId: repo.id,
        message: `Request for access to premium repository: ${repo.name}`
      });

      toast.success('Your request has been submitted successfully! You will receive an email when it is reviewed.');
      // Update pending repos list immediately
      setPendingRepos(prev => new Set([...prev, repo.id]));
      // Refresh request status
      fetchApprovedAccess();
    } catch (err) {
      console.error('Error creating request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle preview
  const handlePreview = (url, type) => {
    if (type === 'github') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle rating
  const handleRate = async (repoId, newRating) => {
    if (!isAuthenticated()) {
      toast.info('Please log in to rate repositories');
      return;
    }

    try {
      setRepositories(repos =>
        repos.map(repo => {
          if (repo.id === repoId) {
            return {
              ...repo,
              rating: newRating,
              userRating: newRating,
            };
          }
          return repo;
        })
      );

      await api.post(`/repositories/${repoId}/rate`, { rating: newRating });
      toast.success('Rating submitted successfully');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e, repoId) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.info('Please log in to comment');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      const response = await api.post(`/repositories/${repoId}/comments`, {
        content: comment,
        userId: user.id,
        userName: user.name || user.email || 'Anonymous'
      });
      
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

  // Handle edit (admin only)
  const handleEdit = (repo) => {
    navigate(`/admin/repositories/${repo.id}/edit`);
  };

  // Render star rating
  const renderStars = (rating, repoId, interactive = false) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && handleRate(repoId, star)}
          className={`${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'hover:text-yellow-500 cursor-pointer' : 'cursor-default'}`}
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

    if (error && repositories.length === 0) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
            {/* Thumbnail/Preview */}
            {repo.thumbnailUrl && (
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={repo.thumbnailUrl.startsWith('http') ? repo.thumbnailUrl : `http://localhost:5119${repo.thumbnailUrl}`}
                  alt={repo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><FaGithub class="text-4xl" /></div>';
                  }}
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
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
                  
                  {/* Tags: Domain, Category, Technologies */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {repo.domain}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      repo.category === 'Premium' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {repo.category}
                    </span>
                    {repo.technologies?.slice(0, 2).map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Admin Edit Button */}
                {isAdmin() && (
                  <button
                    onClick={() => handleEdit(repo)}
                    className="ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Repository"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{repo.description}</p>

              {/* License and Version */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                {repo.licenseType && (
                  <span>License: {repo.licenseType}</span>
                )}
                {repo.version && (
                  <span>v{repo.version}</span>
                )}
              </div>

              {/* Rating */}
              <div className="mb-4">
                {renderStars(repo.rating || 0, repo.id, isAuthenticated())}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span>⭐ {repo.stars || 0}</span>
                  <span>🍴 {repo.forks || 0}</span>
                  <span>⬇️ {repo.downloads || 0}</span>
                </div>
                <button
                  onClick={() => toggleComments(repo.id)}
                  className={`flex items-center text-sm ${showComments && repo.id === activeRepoId ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FaComment className="mr-1" /> 
                  {repo.comments?.length || 0}
                </button>
              </div>
              
              {/* Comments Section */}
              {activeRepoId === repo.id && showComments && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
                  
                  {/* Comment Form */}
                  {isAuthenticated() ? (
                    <form onSubmit={(e) => handleCommentSubmit(e, repo.id)} className="mb-4">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <textarea
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
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
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {repo.comments?.length > 0 ? repo.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.userName || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mt-2">{comment.content}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                {/* Preview Button */}
                {repo.documentPreviewUrl && (
                  <button
                    onClick={() => handlePreview(repo.documentPreviewUrl, 'document')}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                    title="Preview Documentation"
                  >
                    <FaEye className="mr-1" /> Preview
                  </button>
                )}
                
                {/* Download/Contact Button based on category */}
                {repo.category === 'Premium' ? (
                  approvedRepos.has(repo.id) ? (
                    <button
                      onClick={() => handleDownload(repo)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  ) : pendingRepos.has(repo.id) ? (
                    <button
                      disabled
                      className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded cursor-not-allowed flex items-center justify-center"
                      title="Request Pending - Waiting for admin approval"
                    >
                      <FaEnvelope className="mr-1" /> Pending Request
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContactAdmin(repo)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <FaEnvelope className="mr-1" /> Request Access
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleDownload(repo)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                    disabled={!isAuthenticated() && repo.category !== 'Free'}
                  >
                    <FaDownload className="mr-1" /> 
                    {repo.gitHubUrl ? 'Download from GitHub' : 'Download'}
                  </button>
                )}
                
                {/* GitHub Link */}
                {repo.gitHubUrl && (
                  <a
                    href={repo.gitHubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 transition-colors flex items-center justify-center"
                    title="View on GitHub"
                  >
                    <FaGithub />
                  </a>
                )}
              </div>
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
              placeholder="Search repositories by name, description, or technologies..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
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
          </div>
          
          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Free">Free</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserRepositoriesPage;
