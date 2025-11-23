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
    // Skip redirect for repositories endpoints - they're now public with [AllowAnonymous]
    if (error.response?.status === 401 && !error.config?.url?.includes('/repositories')) {
      // For non-repositories requests, redirect to login
      console.error('401 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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
  { id: 'non-premium', name: 'Non-Premium' }
];

const AdminRepositoriesPage = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRepo, setViewingRepo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
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
  const openAddModal = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Ensure domains are loaded before opening modal
    if (domains.length <= 1) { // Only "All Domains" option
      try {
        console.log('Fetching domains before opening modal...');
        const domainsResponse = await api.get('/api/domains');
        if (domainsResponse.data && Array.isArray(domainsResponse.data)) {
          const domainsList = domainsResponse.data.map(d => {
            if (typeof d === 'string') {
              return { id: d, name: d };
            } else {
              return { 
                id: d.Id || d.id || d.name || d.Name, 
                name: d.Name || d.name || d.Id || d.id 
              };
            }
          });
          setDomains([{ id: 'all', name: 'All Domains' }, ...domainsList]);
          console.log('Domains loaded for modal:', [{ id: 'all', name: 'All Domains' }, ...domainsList]);
        }
      } catch (domainErr) {
        console.error('Error fetching domains for modal:', domainErr);
        toast.error('Failed to load domains. Please refresh the page.');
      }
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
      accessType: 'free',
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
    
    // If accessType is changed to 'non-premium', clear gitHubUrl (non-premium shouldn't have GitHub URL)
    if (name === 'accessType' && value === 'non-premium') {
      setNewRepo(prev => ({
        ...prev,
        [name]: value,
        gitHubUrl: '' // Clear GitHub URL for non-premium
      }));
    } else {
      setNewRepo(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
      // Map Category and AccessLevel back to accessType for editing
      // Non-premium = Free category but NO GitHub URL
      // Free = Free category WITH GitHub URL
      accessType: repo.category === 'Premium' ? 'premium' : 
                   (repo.category === 'Free' && repo.gitHubUrl ? 'free' : 'non-premium'),
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
      // Ensure domain is a string (name), not an ID
      const domainValue = typeof newRepo.domain === 'string' 
        ? newRepo.domain 
        : domains.find(d => d.id === newRepo.domain || d.name === newRepo.domain)?.name || newRepo.domain;
      
      if (!domainValue || domainValue === '') {
        toast.error('Please select a domain');
        setIsSubmitting(false);
        return;
      }
      
      // Map accessType to Category and AccessLevel
      let category = 'Free';
      let accessLevel = 'public';
      let gitHubUrl = newRepo.gitHubUrl?.trim() || null;
      
      if (newRepo.accessType === 'free') {
        category = 'Free';
        accessLevel = 'public';
        // Free must have GitHub URL
        if (!gitHubUrl) {
          toast.error('Free repositories must have a GitHub URL');
          setIsSubmitting(false);
          return;
        }
      } else if (newRepo.accessType === 'premium') {
        category = 'Premium';
        accessLevel = 'premium';
        // Premium can have GitHub URL (optional)
      } else if (newRepo.accessType === 'non-premium') {
        category = 'Free'; // Non-premium is still free category
        accessLevel = 'public'; // But view-only for guests (handled in frontend)
        // Non-premium should NOT have GitHub URL (this is how we distinguish it from free)
        gitHubUrl = null;
      }
      
      const repoData = {
        name: newRepo.name.trim(),
        description: newRepo.description.trim(),
        domain: domainValue, // Use domain name as string
        category: category,
        gitHubUrl: gitHubUrl,
        downloadUrl: newRepo.downloadUrl?.trim() || null,
        documentPreviewUrl: newRepo.documentPreviewUrl?.trim() || null,
        thumbnailUrl: newRepo.thumbnailUrl?.trim() || null,
        licenseType: newRepo.licenseType || 'MIT',
        version: newRepo.version || '1.0.0',
        technologies: Array.isArray(newRepo.technologies) 
          ? JSON.stringify(newRepo.technologies) 
          : (typeof newRepo.technologies === 'string' ? newRepo.technologies : '[]'),
        accessLevel: accessLevel,
        stars: newRepo.stars || 0,
        forks: newRepo.forks || 0,
        downloads: newRepo.downloads || 0,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        // Only include these for updates
        ...(newRepo.id && {
          id: newRepo.id,
          createdBy: newRepo.createdBy,
          createdAt: newRepo.createdAt
        })
      };
      
      console.log('Submitting repository data:', { ...repoData, technologies: '[...]' });
      
      if (newRepo.id) {
        // Update existing repository
        const response = await api.put(`/api/repositories/${newRepo.id}`, repoData);
        console.log('Repository updated:', response.data);
        
        // Optimistically update the repository in the list
        const updatedRepo = {
          ...response.data,
          technologies: typeof response.data.technologies === 'string' 
            ? JSON.parse(response.data.technologies || '[]') 
            : (response.data.technologies || [])
        };
        
        setRepositories(prev => prev.map(repo => 
          repo.id === newRepo.id ? updatedRepo : repo
        ));
        
        toast.success('Repository updated successfully!');
      } else {
        // Create new repository
        const response = await api.post('/api/repositories', repoData);
        console.log('Repository created:', response.data);
        
        // Optimistically add the new repository to the list immediately
        const newRepository = {
          ...response.data,
          technologies: typeof response.data.technologies === 'string' 
            ? JSON.parse(response.data.technologies || '[]') 
            : (response.data.technologies || [])
        };
        
        // Add to the beginning of the list (most recent first)
        setRepositories(prev => [newRepository, ...prev]);
        
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
        thumbnailUrl: '',
        licenseType: 'MIT',
        version: '1.0.0',
        technologies: [],
        accessLevel: 'public',
        stars: 0,
        forks: 0,
        downloads: 0,
        isFeatured: false
      });
      
      // Close modal
      setShowModal(false);
      
      // Refresh data from server in background to ensure consistency
      // This will update the list with server data, but user already sees the new item
      fetchData().catch(err => {
        console.error('Error refreshing data after save:', err);
        // Don't show error to user since we already updated optimistically
      });
    } catch (error) {
      console.error('Error saving repository:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Handle 401 errors specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'Your session has expired. Please log in again.';
        toast.error(errorMessage, { duration: 4000 });
        // Don't redirect immediately - give user time to see the error
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }, 3000);
        return;
      }
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.errors) {
          // Show field-specific errors
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          toast.error(`Validation error: ${errorMessages}`, { duration: 5000 });
        } else {
          toast.error(errorData?.message || 'Validation error. Please check your input.', { duration: 4000 });
        }
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving the repository';
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to refresh data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching repositories and domains...');
      const [reposResponse, domainsResponse] = await Promise.all([
        api.get('/api/repositories').catch(err => {
          console.error('Error fetching repositories:', {
            url: err.config?.url,
            method: err.config?.method,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            headers: err.config?.headers
          });
          throw err;
        }),
        api.get('/api/domains').catch(err => {
          console.error('Error fetching domains:', {
            url: err.config?.url,
            method: err.config?.method,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
          });
          throw err;
        })
      ]);
      
      console.log('Repositories data:', reposResponse.data);
      console.log('Domains data:', domainsResponse.data);
      
      setRepositories(reposResponse.data);
      setFilteredRepos(reposResponse.data);
      
      // Handle domains - they might be array of strings or array of objects with Id/Name or id/name
      let domainsList = [];
      if (domainsResponse.data && Array.isArray(domainsResponse.data)) {
        domainsList = domainsResponse.data.map(d => {
          if (typeof d === 'string') {
            return { id: d, name: d };
          } else {
            // Handle PascalCase (Id, Name) or camelCase (id, name)
            return { 
              id: d.Id || d.id || d.name || d.Name, 
              name: d.Name || d.name || d.Id || d.id 
            };
          }
        });
      }
      setDomains([{ id: 'all', name: 'All Domains' }, ...domainsList]);
      console.log('Processed domains:', [{ id: 'all', name: 'All Domains' }, ...domainsList]);
      setError(null);
      return reposResponse.data;
    } catch (err) {
      console.error('Error in fetchData:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      setError(`Failed to load data: ${err.message}`);
      toast.error(`Failed to load repositories: ${err.response?.data?.message || err.message}`);
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
          api.get('/api/repositories', { signal }),
          api.get('/api/domains', { signal })
        ]);
        
        setRepositories(reposResponse.data);
        setFilteredRepos(reposResponse.data);
        
        // Handle domains - they might be array of strings or array of objects with Id/Name or id/name
        let domainsList = [];
        if (domainsResponse.data && Array.isArray(domainsResponse.data)) {
          domainsList = domainsResponse.data.map(d => {
            if (typeof d === 'string') {
              return { id: d, name: d };
            } else {
              // Handle PascalCase (Id, Name) or camelCase (id, name)
              return { 
                id: d.Id || d.id || d.name || d.Name, 
                name: d.Name || d.name || d.Id || d.id 
              };
            }
          });
        }
        setDomains([{ id: 'all', name: 'All Domains' }, ...domainsList]);
        console.log('Processed domains in useEffect:', [{ id: 'all', name: 'All Domains' }, ...domainsList]);
        setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading data:', err);
        console.error('Error response data:', err.response?.data);
        console.error('Error status:', err.response?.status);
        console.error('Error message:', err.response?.data?.message || err.message);
        
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load data. Please try again later.';
        setError(errorMessage);
        toast.error(`Failed to load repositories: ${errorMessage}`);
        
        // If it's a database error, set empty arrays to allow the page to render
        // Keep a warning message but don't block the UI
        if (err.response?.status === 500) {
          setRepositories([]);
          setFilteredRepos([]);
          // Try to fetch domains separately even if repositories fail
          try {
            const domainsResponse = await api.get('/api/domains');
            console.log('Domains response (on error):', domainsResponse.data);
            if (domainsResponse.data && Array.isArray(domainsResponse.data)) {
              // Handle both formats: array of strings or array of objects with Id/Name or id/name
              const domainsList = domainsResponse.data.map(d => {
                if (typeof d === 'string') {
                  return { id: d, name: d };
                } else {
                  // Handle PascalCase (Id, Name) or camelCase (id, name)
                  return { 
                    id: d.Id || d.id || d.name || d.Name, 
                    name: d.Name || d.name || d.Id || d.id 
                  };
                }
              });
              setDomains([{ id: 'all', name: 'All Domains' }, ...domainsList]);
              console.log('Processed domains (on error):', [{ id: 'all', name: 'All Domains' }, ...domainsList]);
            } else {
              setDomains([{ id: 'all', name: 'All Domains' }]);
            }
          } catch (domainErr) {
            console.error('Error fetching domains separately:', domainErr);
            setDomains([{ id: 'all', name: 'All Domains' }]);
          }
          // Keep error as warning, but don't block the page
          setError(`Warning: ${errorMessage}. You can still create repositories.`);
        }
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
    if (selectedDomain && selectedDomain !== 'All Domains' && selectedDomain !== 'all') {
      result = result.filter(repo => {
        const repoDomain = repo.domain;
        // Check if repo.domain matches selectedDomain (which is domain.name)
        return repoDomain === selectedDomain;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
    result = result.filter(repo => {
      const name = (repo.name || '').toLowerCase();
      const description = (repo.description || '').toLowerCase();
      const domain = (repo.domain || '').toLowerCase();
      const category = (repo.category || '').toLowerCase();
      const technologies = typeof repo.technologies === 'string' 
        ? JSON.parse(repo.technologies || '[]') 
        : (repo.technologies || []);
      const techMatch = technologies.some(tech => tech.toLowerCase().includes(query));
      
      return name.includes(query) || 
             description.includes(query) || 
             domain.includes(query) ||
             category.includes(query) ||
             techMatch;
    });
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
        await api.delete(`/api/repositories/${id}`);
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

  // Don't return early on error - show the page with error message and allow creating repositories
  // if (error) {
  //   return (
  //     <div className="container mx-auto py-6 px-4">
  //       <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Repositories</h1>
  //       {error && (
  //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
  //           <span className="block sm:inline">{error}</span>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto py-6 px-4">
      <Helmet>
        <title>Admin Repositories - Wordpress Portfolio</title>
        <meta name="description" content="Admin panel for managing repositories in the Wordpress Portfolio application." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Show error/warning message at the top if exists */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-yellow-600 hover:text-yellow-800 font-bold"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manage Repositories</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 pr-3 py-2"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.name}>
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
                      GitHub URL {newRepo.accessType === 'free' ? '*' : ''}
                      {newRepo.accessType === 'non-premium' && (
                        <span className="text-xs text-gray-500 ml-2">(Not required for non-premium)</span>
                      )}
                    </label>
                    <input
                      type="url"
                      id="gitHubUrl"
                      name="gitHubUrl"
                      value={newRepo.gitHubUrl || ''}
                      onChange={handleInputChange}
                      disabled={newRepo.accessType === 'non-premium'}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        newRepo.accessType === 'non-premium' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="https://github.com/username/repo"
                      required={newRepo.accessType === 'free'}
                    />
                    {newRepo.accessType === 'non-premium' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Non-premium repositories don't have GitHub URLs. Use Download URL instead.
                      </p>
                    )}
                  </div>
                  
                  {/* Download URL (for non-premium) */}
                  <div>
                    <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700">
                      Download URL {newRepo.accessType === 'non-premium' ? '*' : ''}
                      {newRepo.accessType === 'non-premium' && (
                        <span className="text-xs text-gray-500 ml-2">(Required for non-premium)</span>
                      )}
                    </label>
                    <input
                      type="url"
                      id="downloadUrl"
                      name="downloadUrl"
                      value={newRepo.downloadUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="https://example.com/download"
                      required={newRepo.accessType === 'non-premium'}
                    />
                    {newRepo.accessType === 'non-premium' && (
                      <p className="mt-1 text-xs text-gray-500">
                        This URL will be used for downloads by registered users.
                      </p>
                    )}
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
                      {domains.filter(d => d.id !== 'all' && d.name).map((domain) => (
                        <option key={domain.id} value={domain.name}>
                          {domain.name}
                        </option>
                      ))}
                      {domains.filter(d => d.id !== 'all' && d.name).length === 0 && (
                        <option value="" disabled>No domains available. Please create domains first.</option>
                      )}
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

      {/* View Repository Modal */}
      {showViewModal && viewingRepo && (
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
          onClick={() => {
            setShowViewModal(false);
            setViewingRepo(null);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Repository Details</h2>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingRepo(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Thumbnail */}
                {viewingRepo.thumbnailUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={viewingRepo.thumbnailUrl} 
                      alt={viewingRepo.name} 
                      className="max-w-full h-64 object-contain rounded-lg border border-gray-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingRepo.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Version</label>
                    <p className="text-gray-900">{viewingRepo.version || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Domain</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {viewingRepo.domain || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Access Type</label>
                    {(() => {
                      // Determine access type dynamically
                      let accessType = 'N/A';
                      let badgeClass = 'bg-gray-100 text-gray-800';
                      
                      if (viewingRepo.category === 'Premium') {
                        accessType = 'Premium';
                        badgeClass = 'bg-yellow-100 text-yellow-800';
                      } else if (viewingRepo.category === 'Free' && viewingRepo.gitHubUrl) {
                        accessType = 'Free';
                        badgeClass = 'bg-green-100 text-green-800';
                      } else if (viewingRepo.category === 'Free' && !viewingRepo.gitHubUrl) {
                        accessType = 'Non-Premium';
                        badgeClass = 'bg-blue-100 text-blue-800';
                      }
                      
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                          {accessType}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingRepo.status === 'active' ? 'bg-green-100 text-green-800' : 
                      viewingRepo.status === 'archived' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingRepo.status || 'active'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Access Level</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {viewingRepo.accessLevel || 'public'}
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{viewingRepo.description || 'No description provided'}</p>
                </div>
                
                {/* Technologies */}
                {(() => {
                  const technologies = typeof viewingRepo.technologies === 'string' 
                    ? JSON.parse(viewingRepo.technologies || '[]') 
                    : (viewingRepo.technologies || []);
                  
                  return technologies.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Technologies</label>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {/* URLs */}
                <div className="space-y-3">
                  {viewingRepo.gitHubUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">GitHub URL</label>
                      <a 
                        href={viewingRepo.gitHubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {viewingRepo.gitHubUrl}
                      </a>
                    </div>
                  )}
                  {viewingRepo.downloadUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Download URL</label>
                      <a 
                        href={viewingRepo.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {viewingRepo.downloadUrl}
                      </a>
                    </div>
                  )}
                  {viewingRepo.documentPreviewUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Document Preview URL</label>
                      <a 
                        href={viewingRepo.documentPreviewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {viewingRepo.documentPreviewUrl}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Stars</label>
                    <p className="text-2xl font-bold text-gray-900">{viewingRepo.stars || 0}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Forks</label>
                    <p className="text-2xl font-bold text-gray-900">{viewingRepo.forks || 0}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Downloads</label>
                    <p className="text-2xl font-bold text-gray-900">{viewingRepo.downloads || 0}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-1">License</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingRepo.licenseType || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-sm text-gray-500">
                  <div>
                    <label className="block font-medium mb-1">Created At</label>
                    <p>{viewingRepo.createdAt ? new Date(viewingRepo.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Last Updated</label>
                    <p>{viewingRepo.lastUpdated ? new Date(viewingRepo.lastUpdated).toLocaleString() : 'N/A'}</p>
                  </div>
                  {viewingRepo.createdBy && (
                    <div>
                      <label className="block font-medium mb-1">Created By</label>
                      <p>{viewingRepo.createdBy}</p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {viewingRepo.gitHubUrl && (
                    <a
                      href={viewingRepo.gitHubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C17.138 18.18 20 14.425 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                      </svg>
                      View on GitHub
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingRepo);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleDelete(viewingRepo.id);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repositories Table */}
      {filteredRepos.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepos.map((repo) => {
                  return (
                    <tr key={repo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {repo.thumbnailUrl && (
                            <img 
                              src={repo.thumbnailUrl} 
                              alt={repo.name} 
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                            {repo.version && (
                              <div className="text-sm text-gray-500">v{repo.version}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {repo.domain || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // Determine access type dynamically
                          let accessType = 'N/A';
                          let badgeClass = 'bg-gray-100 text-gray-800';
                          
                          if (repo.category === 'Premium') {
                            accessType = 'Premium';
                            badgeClass = 'bg-yellow-100 text-yellow-800';
                          } else if (repo.category === 'Free' && repo.gitHubUrl) {
                            accessType = 'Free';
                            badgeClass = 'bg-green-100 text-green-800';
                          } else if (repo.category === 'Free' && !repo.gitHubUrl) {
                            accessType = 'Non-Premium';
                            badgeClass = 'bg-blue-100 text-blue-800';
                          }
                          
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                              {accessType}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={repo.description}>
                          {repo.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          repo.status === 'active' ? 'bg-green-100 text-green-800' : 
                          repo.status === 'archived' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {repo.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setViewingRepo(repo);
                              setShowViewModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="View Repository Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(repo)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Repository"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(repo.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Repository"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No repositories found. Add your first repository to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRepositoriesPage;
