import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import axios from 'axios';

const UserPublicationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // Fetch publications from API
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get('http://localhost:5119/api/Publications');
        
        // Transform API data to match frontend structure
        const transformedPublications = response.data.map(pub => ({
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
          downloads: pub.downloads,
          keywords: JSON.parse(pub.keywords || '[]'),
          status: pub.status
        }));

        // If no data from API, use fallback mock data
        if (transformedPublications.length === 0) {
          const mockPublications = [
            {
              id: 1,
              title: 'Deep Learning Approaches for Natural Language Processing',
              authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emily Rodriguez'],
              domain: 'AI',
              abstract: 'This paper presents novel deep learning architectures for natural language processing tasks, including sentiment analysis, named entity recognition, and machine translation. Our approach demonstrates significant improvements over existing state-of-the-art methods.',
              thumbnail: '/images/papers/nlp-deep-learning.jpg',
              documentPreview: '/docs/nlp-deep-learning-preview.pdf',
              videoPreview: 'https://youtube.com/watch?v=example1',
              downloadUrl: '/downloads/nlp-deep-learning.pdf',
              publishedDate: '2023-10-15',
              downloads: 1245,
              keywords: ['deep learning', 'NLP', 'neural networks', 'transformers'],
              status: 'published'
            },
            {
              id: 2,
            title: 'Scalable Cloud Architecture Patterns for Microservices',
            authors: ['Dr. James Wilson', 'Prof. Lisa Zhang'],
            domain: 'Cloud',
            abstract: 'We explore scalable cloud architecture patterns specifically designed for microservices deployment. This research covers containerization strategies, service mesh implementations, and auto-scaling mechanisms in distributed systems.',
            thumbnail: '/images/papers/cloud-microservices.jpg',
            documentPreview: '/docs/cloud-microservices-preview.pdf',
            videoPreview: null,
            downloadUrl: '/downloads/cloud-microservices.pdf',
            publishedDate: '2023-11-02',
            downloads: 892,
            keywords: ['cloud computing', 'microservices', 'scalability', 'containers'],
            status: 'published'
          },
          {
            id: 3,
            title: 'Machine Learning Optimization Techniques for Edge Computing',
            authors: ['Dr. Alex Kumar', 'Prof. Maria Santos', 'Dr. Robert Kim'],
            domain: 'ML',
            abstract: 'This study investigates optimization techniques for deploying machine learning models on edge devices. We present novel compression algorithms and quantization methods that maintain model accuracy while reducing computational requirements.',
            thumbnail: '/images/papers/ml-edge-computing.jpg',
            documentPreview: '/docs/ml-edge-computing-preview.pdf',
            videoPreview: 'https://youtube.com/watch?v=example3',
            downloadUrl: '/downloads/ml-edge-computing.pdf',
            publishedDate: '2023-09-28',
            downloads: 1567,
            keywords: ['machine learning', 'edge computing', 'optimization', 'model compression'],
            status: 'published'
          },
          {
            id: 4,
            title: 'Blockchain Security Protocols for Decentralized Applications',
            authors: ['Dr. David Thompson', 'Prof. Anna Petrov'],
            domain: 'Blockchain',
            abstract: 'We propose new security protocols for decentralized applications built on blockchain technology. Our research addresses common vulnerabilities and presents cryptographic solutions for enhanced security in smart contracts.',
            thumbnail: '/images/papers/blockchain-security.jpg',
            documentPreview: '/docs/blockchain-security-preview.pdf',
            videoPreview: null,
            downloadUrl: '/downloads/blockchain-security.pdf',
            publishedDate: '2023-12-05',
            downloads: 723,
            keywords: ['blockchain', 'security', 'smart contracts', 'cryptography'],
            status: 'published'
          },
          {
            id: 5,
            title: 'Quantum Computing Applications in Cryptography',
            authors: ['Prof. Catherine Lee', 'Dr. Mark Anderson'],
            domain: 'Quantum',
            abstract: 'This paper explores the implications of quantum computing on modern cryptographic systems. We analyze quantum algorithms for breaking traditional encryption and propose quantum-resistant cryptographic methods.',
            thumbnail: '/images/papers/quantum-crypto.jpg',
            documentPreview: '/docs/quantum-crypto-preview.pdf',
            videoPreview: 'https://youtube.com/watch?v=example5',
            downloadUrl: '/downloads/quantum-crypto.pdf',
            publishedDate: '2023-08-20',
            downloads: 2103,
            keywords: ['quantum computing', 'cryptography', 'quantum algorithms', 'security'],
            status: 'published'
          },
          {
            id: 6,
            title: 'IoT Data Analytics and Real-time Processing Frameworks',
            authors: ['Dr. Jennifer Wu', 'Prof. Carlos Martinez', 'Dr. Ahmed Hassan'],
            domain: 'IoT',
            abstract: 'We present comprehensive frameworks for real-time processing and analytics of IoT data streams. Our approach includes novel algorithms for data fusion, anomaly detection, and predictive analytics in IoT environments.',
            thumbnail: '/images/papers/iot-analytics.jpg',
            documentPreview: '/docs/iot-analytics-preview.pdf',
            videoPreview: null,
            downloadUrl: '/downloads/iot-analytics.pdf',
            publishedDate: '2023-07-12',
            downloads: 1334,
            keywords: ['IoT', 'data analytics', 'real-time processing', 'anomaly detection'],
            status: 'published'
          }
        ];
        
          setPublications(mockPublications);
        } else {
          setPublications(transformedPublications);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching publications:', err);
        // Fallback to mock data on error
        const mockPublications = [
          {
            id: 1,
            title: 'Deep Learning Approaches for Natural Language Processing',
            authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emily Rodriguez'],
            domain: 'AI',
            abstract: 'This paper presents novel deep learning architectures for natural language processing tasks, including sentiment analysis, named entity recognition, and machine translation. Our approach demonstrates significant improvements over existing state-of-the-art methods.',
            thumbnail: '/images/papers/nlp-deep-learning.jpg',
            documentPreview: '/docs/nlp-deep-learning-preview.pdf',
            videoPreview: 'https://youtube.com/watch?v=example1',
            downloadUrl: '/downloads/nlp-deep-learning.pdf',
            publishedDate: '2023-10-15',
            downloads: 1245,
            keywords: ['deep learning', 'NLP', 'neural networks', 'transformers'],
            status: 'published'
          }
        ];
        setPublications(mockPublications);
        setError('Using offline data. Backend connection failed.');
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Get unique domains for filter dropdown
  const domains = ['All', ...new Set(publications.map(pub => pub.domain))];

  // Filter and search publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pub.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pub.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = selectedDomain === 'All' || pub.domain === selectedDomain;
    
    return matchesSearch && matchesDomain;
  });

  const handleDownload = async (publication) => {
    if (!isAuthenticated()) {
      alert('Please login to download publications.');
      return;
    }
    
    try {
      // Increment download count via API
      await axios.post(`http://localhost:5119/api/Publications/${publication.id}/download`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setPublications(publications.map(pub => 
        pub.id === publication.id 
          ? { ...pub, downloads: pub.downloads + 1 }
          : pub
      ));
      
      // Open download
      if (publication.downloadUrl) {
        window.open(publication.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error tracking download:', err);
      // Still allow download even if tracking fails
      if (publication.downloadUrl) {
        window.open(publication.downloadUrl, '_blank');
      }
    }
  };

  const handlePreview = (previewUrl, type = 'document') => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const deletePublication = async (id) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPublications(publications.filter(pub => pub.id !== id));
      } catch (err) {
        console.error('Error deleting publication:', err);
        setError('Failed to delete publication.');
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
            <h1 className="text-2xl font-bold text-gray-900">Research & Publications</h1>
            <p className="text-gray-500">Explore and download research papers from various domains</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
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
              <option key={domain} value={domain}>
                {domain === 'All' ? 'All Domains' : domain}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPublications.length > 0 ? (
            filteredPublications.map((pub) => (
              <div key={pub.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition duration-200">
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  {pub.thumbnail ? (
                    <img 
                      src={pub.thumbnail} 
                      alt={pub.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-white text-center p-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{pub.domain}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Title and Domain */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{pub.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ml-2">
                      {pub.domain}
                    </span>
                  </div>

                  {/* Authors */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Authors:</span> {pub.authors.join(', ')}
                    </p>
                  </div>

                  {/* Abstract */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{pub.abstract}</p>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {pub.keywords.slice(0, 4).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {keyword}
                        </span>
                      ))}
                      {pub.keywords.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          +{pub.keywords.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Publication Info */}
                  <div className="mb-4 flex items-center text-sm text-gray-500">
                    <span>Published: {new Date(pub.publishedDate).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{pub.downloads} downloads</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePreview(pub.documentPreview, 'document')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Preview
                    </button>

                    {pub.videoPreview && (
                      <button
                        onClick={() => handlePreview(pub.videoPreview, 'video')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
                        </svg>
                        Video
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(pub)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="col-span-full text-center p-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No publications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDomain !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No research publications are currently available.'}
            </p>
            {(searchTerm || selectedDomain !== 'All') && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDomain('All');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default UserPublicationsPage;
