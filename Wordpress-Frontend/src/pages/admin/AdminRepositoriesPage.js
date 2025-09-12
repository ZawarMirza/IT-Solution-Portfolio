import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:5119';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const LICENSE_TYPES = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'Unlicense',
  'Other'
];

const ACCESS_TYPES = [
  { id: 'free', name: 'Free' },
  { id: 'premium', name: 'Premium' },
  { id: 'private', name: 'Private' }
];

const AdminRepositoriesPage = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New repository form state
  const [newRepo, setNewRepo] = useState({
    title: '',
    description: '',
    githubUrl: '',
    documentPreview: '',
    tags: [],
    domain: '',
    licenseType: 'MIT',
    licenseVersion: '1.0.0',
    accessType: 'free',
    isFeatured: false
  });
  
  const [newTag, setNewTag] = useState('');

  // Open modal with empty form
  const openAddModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNewRepo({
      name: '',
      description: '',
      domain: '',
      category: 'Free',
      gitHubUrl: '',
      downloadUrl: '',
      documentPreviewUrl: '',
      licenseType: 'MIT',
      version: '1.0.0',
      technologies: [],
      accessLevel: 'public',
      stars: 0,
      forks: 0,
      downloads: 0,
      isFeatured: false
    });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = 'auto';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRepo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle technology addition
  const handleAddTechnology = (e) => {
    e.preventDefault();
    const tech = newTag.trim();
    if (tech && !newRepo.technologies?.includes(tech)) {
      setNewRepo(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), tech]
      }));
      setNewTag('');
    }
  };

  // Handle technology removal
  const handleRemoveTechnology = (techToRemove) => {
    setNewRepo(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(tech => tech !== techToRemove)
    }));
  };

  // Handle repository edit
  const handleEdit = (repo) => {
    setNewRepo({
      ...repo,
      // Parse technologies from JSON string if needed
      technologies: typeof repo.technologies === 'string' 
        ? JSON.parse(repo.technologies || '[]') 
        : repo.technologies || [],
      // Ensure we have all required fields with default values
      name: repo.name || '',
      description: repo.description || '',
      domain: repo.domain || '',
      category: repo.category || 'Free',
      gitHubUrl: repo.gitHubUrl || '',
      downloadUrl: repo.downloadUrl || '',
      documentPreviewUrl: repo.documentPreviewUrl || '',
      licenseType: repo.licenseType || 'MIT',
      version: repo.version || '1.0.0',
      accessLevel: repo.accessLevel || 'public',
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      downloads: repo.downloads || 0,
      isFeatured: repo.isFeatured || false,
      id: repo.id // Keep the original ID for update
    });
    setShowModal(true);
  };

  // Validate repository form
  const validateForm = () => {
    if (!newRepo.name?.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!newRepo.description?.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!newRepo.domain) {
      toast.error('Please select a domain');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const repoData = {
        ...newRepo,
        name: newRepo.name.trim(),
        description: newRepo.description.trim(),
        gitHubUrl: newRepo.gitHubUrl?.trim() || null,
        downloadUrl: newRepo.downloadUrl?.trim() || null,
        documentPreviewUrl: newRepo.documentPreviewUrl?.trim() || null,
        technologies: Array.isArray(newRepo.technologies) 
          ? JSON.stringify(newRepo.technologies) 
          : '[]',
        lastUpdated: new Date().toISOString(),
        createdBy: newRepo.id ? newRepo.createdBy : null, // Keep existing createdBy for updates
        createdAt: newRepo.id ? newRepo.createdAt : new Date().toISOString() // Keep original creation date for updates
      };
      
      if (newRepo.id) {
        // Update existing repository
        await api.put(`/api/Repositories/${newRepo.id}`, repoData);
        toast.success('Repository updated successfully!');
      } else {
        // Create new repository
        await api.post('/api/Repositories', repoData);
        toast.success('Repository created successfully!');
      }
      
      // Reset form to default values
      setNewRepo({
        name: '',
        description: '',
        domain: '',
        category: 'Free',
        gitHubUrl: '',
        downloadUrl: '',
        documentPreviewUrl: '',
        licenseType: 'MIT',
        version: '1.0.0',
        technologies: [],
        accessLevel: 'public',
        stars: 0,
        forks: 0,
        downloads: 0,
        isFeatured: false
      });
      
      // Close modal and refresh data
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving repository:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while saving the repository';
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to refresh data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reposResponse, domainsResponse] = await Promise.all([
        api.get('/api/Repositories'),
        api.get('/api/Domains')
      ]);
      
      setRepositories(reposResponse.data);
      setFilteredRepos(reposResponse.data);
      setDomains([{ id: 'all', name: 'All Domains' }, ...domainsResponse.data]);
      setError(null);
      return reposResponse.data;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      toast.error('Failed to load repositories. Please refresh the page.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const loadData = async () => {
      try {
        const [reposResponse, domainsResponse] = await Promise.all([
          api.get('/api/Repositories', { signal }),
          api.get('/api/Domains', { signal })
        ]);
        
        setRepositories(reposResponse.data);
        setFilteredRepos(reposResponse.data);
        setDomains([{ id: 'all', name: 'All Domains' }, ...domainsResponse.data]);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error loading data:', err);
          setError('Failed to load data. Please try again later.');
          toast.error('Failed to load repositories. Please refresh the page.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      controller.abort();
    };
  }, []);

  // Filter repositories based on search and domain
  useEffect(() => {
    let result = [...repositories];
    
    // Filter by domain
    if (selectedDomain && selectedDomain !== 'all') {
      result = result.filter(repo => repo.domain === selectedDomain);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(repo => 
        repo.title.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.tags && repo.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredRepos(result);
  }, [repositories, selectedDomain, searchQuery]);

  // Group repositories by domain for display
  const repositoriesByDomain = filteredRepos.reduce((acc, repo) => {
    const domain = domains.find(d => d.id === repo.domain)?.name || 'Other';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(repo);
    return acc;
  }, {});

  // Handle repository deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
      try {
        await api.delete(`/api/Repositories/${id}`);
        toast.success('Repository deleted successfully!');
        
        // Optimistic UI update
        setRepositories(prev => prev.filter(repo => repo.id !== id));
      } catch (error) {
        console.error('Error deleting repository:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete repository';
        toast.error(errorMessage);
        
        // Re-fetch data to ensure consistency
        await fetchData();
      }
    }
  };

  // Action button component based on access type
  const ActionButton = ({ accessType, githubUrl }) => {
    switch (accessType) {
      case 'free':
        return (
          <a 
            href={githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download from GitHub
          </a>
        );
      case 'premium':
        return (
          <button
            onClick={() => window.location.href = '/contact'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Admin
          </button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Repositories</h1>
        <div className="text-center p-10">Loading repositories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Repositories</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Helmet>
        <title>Admin Repositories - Wordpress Portfolio</title>
        <meta name="description" content="Admin panel for managing repositories in the Wordpress Portfolio application." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manage Repositories</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Repository
          </button>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add New Repository</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newRepo.name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newRepo.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* GitHub URL */}
                  <div>
                    <label htmlFor="gitHubUrl" className="block text-sm font-medium text-gray-700">
                      GitHub URL *
                    </label>
                    <input
                      type="url"
                      id="gitHubUrl"
                      name="gitHubUrl"
                      value={newRepo.gitHubUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="https://github.com/username/repo"
                      required
                    />
                  </div>
                  
                  {/* Document Preview */}
                  <div>
                    <label htmlFor="documentPreviewUrl" className="block text-sm font-medium text-gray-700">
                      Document Preview URL
                    </label>
                    <input
                      type="url"
                      id="documentPreviewUrl"
                      name="documentPreviewUrl"
                      value={newRepo.documentPreviewUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="https://example.com/preview"
                    />
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={handleAddTechnology}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newRepo.technologies?.map((tech, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnology(tech)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            <span className="sr-only">Remove tag</span>
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Domain */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                    <select
                      name="domain"
                      value={newRepo.domain}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Select a domain</option>
                      {domains.filter(d => d.id !== 'all').map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Access Type */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
                    <select
                      name="accessType"
                      value={newRepo.accessType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      {ACCESS_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* License Type and Version */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">
                        License Type
                      </label>
                      <select
                        id="licenseType"
                        name="licenseType"
                        value={newRepo.licenseType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        {LICENSE_TYPES.map((license) => (
                          <option key={license} value={license}>
                            {license}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="licenseVersion" className="block text-sm font-medium text-gray-700">
                        License Version
                      </label>
                      <input
                        type="text"
                        id="licenseVersion"
                        name="licenseVersion"
                        value={newRepo.licenseVersion}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., 1.0.0"
                      />
                    </div>
                  </div>
                  
                  {/* Featured Toggle */}
                  <div className="flex items-center">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      checked={newRepo.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                      Mark as featured
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Repository'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Repositories Grid */}
      {Object.keys(repositoriesByDomain).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(repositoriesByDomain).map(([domain, domainRepos]) => (
            <div key={domain} className="mb-8">
              <div className="mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800">{domain}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domainRepos.map((repo) => (
                  <div key={repo.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{repo.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          repo.accessLevel === 'free' ? 'bg-green-100 text-green-800' : 
                          repo.accessLevel === 'premium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {repo.accessLevel ? (repo.accessLevel.charAt(0).toUpperCase() + repo.accessLevel.slice(1)) : 'Unknown'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{repo.description}</p>
                      <div className="flex justify-between space-x-2">
                        <ActionButton accessType={repo.accessLevel} githubUrl={repo.gitHubUrl} />
                        <button 
                          onClick={() => handleEdit(repo)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(repo.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No repositories found. Add your first repository to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRepositoriesPage;
