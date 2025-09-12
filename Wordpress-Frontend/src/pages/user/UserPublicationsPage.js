import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context';
import { Helmet } from 'react-helmet';
import { FiDownload, FiSearch, FiFilter, FiCalendar, FiUser, FiTag, FiPlus } from 'react-icons/fi';
import AddPublicationModal from '../../components/publications/AddPublicationModal';

const UserPublicationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [domains, setDomains] = useState(['All']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Debug effect for modal state
  useEffect(() => {
    console.log('Modal state changed:', isAddModalOpen);
  }, [isAddModalOpen]);
  
  const handleOpenModal = () => {
    console.log('Opening modal');
    setIsAddModalOpen(true);
  };

  // Fetch domains from API
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('http://localhost:5119/api/domains');
        if (!response.ok) {
          throw new Error('Failed to fetch domains');
        }
        const data = await response.json();
        setDomains(['All', ...data.map(domain => domain.name)]);
      } catch (err) {
        console.error('Error fetching domains:', err);
        // Fallback to default domains if API fails
        setDomains(['All', 'AI', 'Machine Learning', 'Cloud Computing', 'Blockchain', 'Cybersecurity', 'Data Science', 'IoT', 'Software Engineering']);
      }
    };

    fetchDomains();
  }, []);

  // Fetch publications from API
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('http://localhost:5119/api/Publications');
        if (!response.ok) {
          throw new Error('Failed to fetch publications');
        }
        const data = await response.json();
        
        // Transform API data to match our frontend structure
        const transformedPublications = data.map(pub => ({
          id: pub.id,
          title: pub.title,
          authors: JSON.parse(pub.authors || '[]'),
          domain: pub.domain,
          abstract: pub.abstract,
          thumbnail: pub.thumbnailUrl,
          documentPreview: pub.documentPreviewUrl,
          videoPreview: pub.videoPreviewUrl,
          downloadUrl: pub.downloadUrl,
          publishedDate: pub.publishedDate,
          downloads: pub.downloads || 0,
          keywords: JSON.parse(pub.keywords || '[]'),
          status: pub.status
        }));

        setPublications(transformedPublications);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching publications:', err);
        setError('Failed to load publications. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    return publications
      .filter(publication => {
        if (searchTerm === '' && selectedDomain === 'All') return true;
        
        const matchesSearch = 
          searchTerm === '' ||
          publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publication.authors.some(author => 
            author.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          publication.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm.toLowerCase())
          );
            
        const matchesDomain = 
          selectedDomain === 'All' || 
          publication.domain === selectedDomain;
          
        return matchesSearch && matchesDomain;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedDate) - new Date(a.publishedDate);
        } else if (sortBy === 'popular') {
          return b.downloads - a.downloads;
        }
        return 0;
      });
  }, [publications, searchTerm, selectedDomain, sortBy]);

  // Handle add new publication
  const handleAddPublication = async (formData) => {
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('authors', JSON.stringify(formData.authors));
      formDataToSend.append('domain', formData.domain);
      formDataToSend.append('abstract', formData.abstract);
      formDataToSend.append('keywords', JSON.stringify(formData.keywords));
      formDataToSend.append('publishedDate', formData.publishedDate);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      if (formData.document) {
        formDataToSend.append('document', formData.document);
      }
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }

      const response = await fetch('http://localhost:5119/api/Publications', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add publication');
      }
      
      // Refresh the publications list
      const newPublication = await response.json();
      const transformedPublication = {
        ...newPublication,
        authors: JSON.parse(newPublication.authors || '[]'),
        keywords: JSON.parse(newPublication.keywords || '[]')
      };
      
      // Add the new publication to the list
      setPublications(prev => [transformedPublication, ...prev]);
      
      // Close the modal
      setIsAddModalOpen(false);
      return true;
    } catch (error) {
      console.error('Error adding publication:', error);
      throw error;
    }
  };

  // Handle download
  const handleDownload = async (publication) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    
    try {
      // Increment download count
      await fetch(`http://localhost:5119/api/Publications/${publication.id}/download`, {
        method: 'PUT'
      });
      
      // Update local state
      setPublications(publications.map(pub => 
        pub.id === publication.id 
          ? { ...pub, downloads: (pub.downloads || 0) + 1 } 
          : pub
      ));
      
      // Trigger download
      window.open(publication.downloadUrl, '_blank');
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading publications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Research Publications - Wordpress Portfolio</title>
        <meta name="description" content="Browse our collection of research publications in various domains including AI, Machine Learning, Cloud Computing, and more." />
      </Helmet>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Publications</h1>
          <p className="mt-1 text-gray-600">Browse and manage research publications</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="absolute right-3 top-3.5 text-gray-400" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="appearance-none bg-white border rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain === 'All' ? 'All Domains' : domain}
                </option>
              ))}
            </select>
            <FiFilter className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
      
      {/* Publications Grid */}
      {filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map(publication => (
            <div key={publication.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
              {publication.thumbnail && (
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={publication.thumbnail} 
                    alt={publication.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder-paper.jpg';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {publication.domain}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <FiCalendar className="mr-1" />
                    {new Date(publication.publishedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2" title={publication.title}>
                  {publication.title}
                </h2>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <FiUser className="mr-1 flex-shrink-0" />
                  <span className="line-clamp-1" title={publication.authors.join(', ')}>
                    {publication.authors.join(', ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {publication.abstract}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {publication.keywords.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FiTag className="mr-1" size={10} />
                      {keyword}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {publication.downloads} {publication.downloads === 1 ? 'download' : 'downloads'}
                  </span>
                  
                  <button
                    onClick={() => handleDownload(publication)}
                    disabled={!isAuthenticated}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isAuthenticated 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                    title={!isAuthenticated ? 'Please login to download' : ''}
                  >
                    <FiDownload className="mr-2" />
                    {isAuthenticated ? 'Download' : 'Login to Download'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No publications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedDomain !== 'All' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No publications available at the moment. Please check back later.'}
          </p>
          {(searchTerm || selectedDomain !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDomain('All');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      
      {/* Add Publication Modal */}
      <AddPublicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPublication}
        domains={domains.filter(d => d !== 'All')}
      />
    </div>
  );
};

export default UserPublicationsPage;