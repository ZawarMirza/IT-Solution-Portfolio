import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRepo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle tag addition
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !newRepo.tags.includes(newTag.trim())) {
      setNewRepo(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setNewRepo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/Repositories', newRepo, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        toast.success('Repository added successfully!');
        setShowModal(false);
        // Reset form
        setNewRepo({
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
        // Refresh repositories
        fetchData();
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      toast.error(error.response?.data?.message || 'Failed to add repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch repositories and domains from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reposResponse, domainsResponse] = await Promise.all([
          axios.get('/api/Repositories'),
          axios.get('/api/Domains')
        ]);
        
        setRepositories(reposResponse.data);
        setDomains(domainsResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load repositories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Filter repositories by selected domain
  const repositoriesByDomain = repositories.reduce((acc, repo) => {
    const domain = repo.domain || 'Uncategorized';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(repo);
    return acc;
  }, {});

  // Handle repository deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/Repositories/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Repository deleted successfully');
        setRepositories(repos => repos.filter(repo => repo.id !== id));
      } catch (error) {
        console.error('Error deleting repository:', error);
        toast.error('Failed to delete repository');
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          <select 
            value={selectedDomain} 
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Domains</option>
            {domains.map(domain => (
              <option key={domain.id} value={domain.name}>{domain.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Repository
          </button>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add New Repository</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      id="title"
                      name="title"
                      value={newRepo.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newRepo.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* GitHub URL */}
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                      GitHub URL *
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={newRepo.githubUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Document Preview */}
                  <div>
                    <label htmlFor="documentPreview" className="block text-sm font-medium text-gray-700">
                      Document Preview URL
                    </label>
                    <input
                      type="url"
                      id="documentPreview"
                      name="documentPreview"
                      value={newRepo.documentPreview}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                    {newRepo.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newRepo.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                            >
                              <span className="sr-only">Remove tag</span>
                              <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Domain */}
                    <div>
                      <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                        Domain *
                      </label>
                      <select
                        id="domain"
                        name="domain"
                        value={newRepo.domain}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a domain</option>
                        {domains.map(domain => (
                          <option key={domain.id} value={domain.name}>{domain.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Access Type */}
                    <div>
                      <label htmlFor="accessType" className="block text-sm font-medium text-gray-700">
                        Access Type *
                      </label>
                      <select
                        id="accessType"
                        name="accessType"
                        value={newRepo.accessType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        {ACCESS_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* License Type */}
                    <div>
                      <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">
                        License Type
                      </label>
                      <select
                        id="licenseType"
                        name="licenseType"
                        value={newRepo.licenseType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        {LICENSE_TYPES.map(license => (
                          <option key={license} value={license}>
                            {license}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* License Version */}
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Is Featured */}
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
                    onClick={() => setShowModal(false)}
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
                          repo.accessType === 'free' ? 'bg-green-100 text-green-800' : 
                          repo.accessType === 'premium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {repo.accessType.charAt(0).toUpperCase() + repo.accessType.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{repo.description}</p>
                      <div className="flex justify-between space-x-2">
                        <ActionButton accessType={repo.accessType} githubUrl={repo.githubUrl} />
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
