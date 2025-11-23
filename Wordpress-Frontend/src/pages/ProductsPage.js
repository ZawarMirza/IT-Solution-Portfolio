import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import api from '../utils/axiosConfig';
import { FaGithub, FaDownload, FaEnvelope, FaTag, FaFileAlt, FaVideo, FaSearch, FaFilter, FaEye, FaStar, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'solutions', 'publications', 'repositories'
  
  // Get search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchCategory = urlParams.get('category');
  const searchDomain = urlParams.get('domain');
  
  // Set active tab based on URL params
  useEffect(() => {
    if (searchCategory) {
      const categoryLower = searchCategory.toLowerCase();
      if (categoryLower === 'products' || categoryLower === 'solutions') {
        setActiveTab(categoryLower === 'products' ? 'products' : 'solutions');
      } else if (categoryLower === 'publications') {
        setActiveTab('publications');
      } else if (categoryLower === 'repositories') {
        setActiveTab('repositories');
      }
    }
  }, [searchCategory]);
  
  // Common state
  const [domains, setDomains] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View details modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRepo, setViewingRepo] = useState(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingRepo, setReviewingRepo] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [userReviews, setUserReviews] = useState(new Map()); // Map of repoId -> reviewId
  const [reviews, setReviews] = useState(new Map()); // Map of repoId -> reviews array
  
  // Products state
  const [products, setProducts] = useState([]);
  const [selectedDomainProduct, setSelectedDomainProduct] = useState('All');
  
  // Solutions state (using products for now)
  const [solutions, setSolutions] = useState([]);
  const [selectedDomainSolution, setSelectedDomainSolution] = useState('All');
  
  // Repositories state
  const [repositories, setRepositories] = useState([]);
  const [selectedDomainRepo, setSelectedDomainRepo] = useState('All');
  
  // Publications state
  const [publications, setPublications] = useState([]);
  const [selectedDomainPub, setSelectedDomainPub] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Apply domain filter from URL params
  useEffect(() => {
    if (searchDomain) {
      if (activeTab === 'products') {
        setSelectedDomainProduct(searchDomain);
      } else if (activeTab === 'solutions') {
        setSelectedDomainSolution(searchDomain);
      } else if (activeTab === 'publications') {
        setSelectedDomainPub(searchDomain);
      } else if (activeTab === 'repositories') {
        setSelectedDomainRepo(searchDomain);
      }
    }
  }, [searchDomain, activeTab]);

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  // Fetch solutions (using products for now)
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        setSolutions(response.data);
      } catch (err) {
        console.error('Error fetching solutions:', err);
        setError('Failed to load solutions. Please try again.');
        setSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'solutions') {
      fetchSolutions();
    }
  }, [activeTab]);

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

  // Filter products by domain
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesDomain = selectedDomainProduct === 'All' || product.domain?.name === selectedDomainProduct;
      return matchesDomain;
    });
  }, [products, selectedDomainProduct]);

  // Filter solutions by domain
  const filteredSolutions = useMemo(() => {
    return solutions.filter((solution) => {
      const matchesDomain = selectedDomainSolution === 'All' || solution.domain?.name === selectedDomainSolution;
      return matchesDomain;
    });
  }, [solutions, selectedDomainSolution]);

  // Filter repositories by domain and access level
  const filteredRepositories = useMemo(() => {
    let filtered = repositories;
    
    // Filter by domain
    if (selectedDomainRepo !== 'All') {
      filtered = filtered.filter(repo => repo.domain === selectedDomainRepo);
    }
    
    // Filter by access level based on user authentication
    if (!isAuthenticated()) {
      // Guest (not logged in): Show non-premium AND free repositories
      // Non-premium = Free category but NO GitHub URL (view-only content)
      // Free = Free category WITH GitHub URL (downloadable)
      filtered = filtered.filter(repo => {
        // Show free repositories (with GitHub URL) and non-premium (without GitHub URL)
        return repo.category === 'Free';
      });
    }
    // Registered User (logged in): Show ALL repositories (free, premium, non-premium)
    // No filtering needed - show everything
    
    return filtered;
  }, [repositories, selectedDomainRepo, isAuthenticated]);

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

  // Track user's repository request status
  const [approvedRepos, setApprovedRepos] = useState(new Set());
  const [pendingRepos, setPendingRepos] = useState(new Set());
  
  // Repository reviews data
  const [repositoryReviews, setRepositoryReviews] = useState(new Map()); // Map of repoId -> { averageRating, reviewCount, reviews }
  
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!isAuthenticated()) return;
      
      try {
        // Fetch user's requests
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
    
    if (activeTab === 'repositories') {
      checkRequestStatus();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch reviews when repositories change
  useEffect(() => {
    if (repositories.length > 0 && activeTab === 'repositories') {
      fetchReviews();
    }
  }, [repositories, activeTab]);

  // Fetch reviews for repositories
  const fetchReviews = async () => {
    try {
      // Fetch user's reviews to check which repos they've reviewed (only if authenticated)
      if (isAuthenticated()) {
        try {
          const myReviewsResponse = await api.get('/Reviews/my-reviews');
          const userReviewsMap = new Map();
          myReviewsResponse.data.forEach((review) => {
            userReviewsMap.set(review.repositoryId, review.id);
          });
          setUserReviews(userReviewsMap);
        } catch (err) {
          console.error('Error fetching user reviews:', err);
        }
      }
      
      // Fetch reviews for all repositories (public data, no auth required)
      const reposWithReviews = new Map();
      for (const repo of repositories) {
        try {
          const reviewsResponse = await api.get(`/Reviews/repository/${repo.id}`);
          const reviews = reviewsResponse.data || [];
          
          // Calculate average rating and review count
          const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          const reviewCount = reviews.length;
          
          reposWithReviews.set(repo.id, {
            reviews: reviews,
            averageRating: averageRating,
            reviewCount: reviewCount
          });
        } catch (err) {
          console.error(`Error fetching reviews for repo ${repo.id}:`, err);
          reposWithReviews.set(repo.id, {
            reviews: [],
            averageRating: 0,
            reviewCount: 0
          });
        }
      }
      setRepositoryReviews(reposWithReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Handle repository download
  const handleRepoDownload = async (repo) => {
    if (repo.category === 'Premium') {
      // Premium: Check if user has approved access
      if (!isAuthenticated()) {
        toast.error('Please log in to access premium repositories');
        return;
      }

      // Check if user has approved access
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
    } else if (repo.gitHubUrl) {
      // Free repositories with GitHub URL: Registered users can download, guests can view
      if (isAuthenticated()) {
        // Registered user: can download
        window.open(repo.gitHubUrl, '_blank', 'noopener,noreferrer');
        toast.success('Opening GitHub repository...');
      } else {
        // Guest: view-only, show message
        toast.info('Please log in to download repositories');
      }
    } else {
      // Non-premium (Free category but no GitHub URL): Registered users can download if downloadUrl exists, guests view-only
      if (isAuthenticated() && repo.downloadUrl) {
        window.open(repo.downloadUrl, '_blank', 'noopener,noreferrer');
        toast.success('Starting download...');
      } else if (!isAuthenticated()) {
        toast.info('Please log in to download. This content is view-only for guests.');
      } else {
        toast.info('Download URL not available for this repository.');
      }
    }
  };

  // Handle contact admin - create premium repository request
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
      // Update pending repos list
      setPendingRepos(prev => new Set([...prev, repo.id]));
      // Refresh request status
      const statusResponse = await api.get('/PremiumRepositoryRequests/my-requests');
      const pending = statusResponse.data
        .filter((req) => req.status === 'pending')
        .map((req) => req.repositoryId);
      setPendingRepos(new Set(pending));
    } catch (err) {
      console.error('Error creating request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle open review modal
  const handleOpenReview = (repo) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to review repositories');
      return;
    }
    setReviewingRepo(repo);
    // Check if user already reviewed this repo
    const existingReviewId = userReviews.get(repo.id);
    if (existingReviewId) {
      // User already reviewed, could show edit option or just allow new review
      toast.info('You have already reviewed this repository');
    }
    setReviewRating(0);
    setReviewComment('');
    setShowReviewModal(true);
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!reviewingRepo) return;
    
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await api.post('/Reviews', {
        repositoryId: reviewingRepo.id,
        rating: reviewRating,
        comment: reviewComment || null
      });

      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewingRepo(null);
      setReviewRating(0);
      setReviewComment('');
      
      // Refresh reviews
      fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    }
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
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaTag className="inline mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'solutions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaTag className="inline mr-2" />
              Solutions
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'publications'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Publications
            </button>
            <button
              onClick={() => setActiveTab('repositories')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'repositories'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaGithub className="inline mr-2" />
              Repositories
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

        {/* Products Tab */}
        {activeTab === 'products' && !loading && (
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
                    onClick={() => setSelectedDomainProduct(domain)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedDomainProduct === domain
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No products found.</p>
      </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {product.image && (
                        <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          {product.title}
                        </h3>
                        {product.caption && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {product.caption}
                          </p>
                        )}
                        {product.domain && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {product.domain.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Solutions Tab */}
        {activeTab === 'solutions' && !loading && (
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
                    onClick={() => setSelectedDomainSolution(domain)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedDomainSolution === domain
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {domain}
                  </button>
                ))}
            </div>
            </div>

            {/* Solutions Grid */}
            {filteredSolutions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No solutions found.</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {solution.image && (
                        <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img
                            src={getImageUrl(solution.image)}
                            alt={solution.title}
                            className="w-full h-full object-cover"
                          />
                </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          {solution.title}
                        </h3>
                        {solution.caption && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {solution.caption}
                          </p>
                        )}
                        {solution.domain && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {solution.domain.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Repositories Tab */}
        {activeTab === 'repositories' && !loading && (
          <div>
            {/* Info message for guests */}
            {!isAuthenticated() && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Guest View:</strong> You are viewing free and non-premium repositories. 
                      <Link to="/login" className="ml-1 font-medium underline hover:text-blue-900 dark:hover:text-blue-200">
                        Log in
                      </Link> to access all repositories including premium content.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
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
                            repo.category === 'Premium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : repo.gitHubUrl
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {repo.category === 'Premium' 
                            ? 'Premium' 
                            : repo.gitHubUrl 
                            ? 'Free' 
                            : 'Non-Premium'}
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
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {repo.licenseType && (
                          <span>License: {repo.licenseType}</span>
                        )}
                        {repo.version && (
                          <span>v{repo.version}</span>
                        )}
                      </div>

                      {/* Rating Display */}
                      {(() => {
                        const reviewData = repositoryReviews.get(repo.id);
                        const averageRating = reviewData?.averageRating || 0;
                        const reviewCount = reviewData?.reviewCount || 0;
                        
                        return (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= Math.round(averageRating) ? (
                                    <FaStar className="text-yellow-400 text-sm" />
                                  ) : (
                                    <FaRegStar className="text-gray-300 dark:text-gray-600 text-sm" />
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({averageRating > 0 ? averageRating.toFixed(1) : '0.0'})
                            </span>
                            {reviewCount > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {repo.category === 'Premium' ? (
                          approvedRepos.has(repo.id) ? (
                            // User has approved access - show download button
                            <button
                              onClick={() => handleRepoDownload(repo)}
                              className="flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded transition duration-200 bg-green-600 hover:bg-green-700 text-white"
                              title="Download Premium Repository"
                            >
                              <FaDownload />
                              Download
                          </button>
                          ) : pendingRepos.has(repo.id) ? (
                            // Request is pending - show pending status
                            <button
                              disabled
                              className="flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded transition duration-200 bg-gray-400 text-white cursor-not-allowed"
                              title="Request Pending - Waiting for admin approval"
                            >
                              <FaEnvelope />
                              Pending Request
                            </button>
                          ) : (
                            // No request yet - show request button
                            <button
                              onClick={() => handleContactAdmin(repo)}
                              className="flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded transition duration-200 bg-yellow-600 hover:bg-yellow-700 text-white"
                              title="Request Access to Premium Repository"
                            >
                              <FaEnvelope />
                              Request Access
                            </button>
                          )
                        ) : repo.gitHubUrl ? (
                          // Free: Has GitHub URL
                          <button
                            onClick={() => handleRepoDownload(repo)}
                            className={`flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded transition duration-200 ${
                              isAuthenticated()
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                            disabled={!isAuthenticated()}
                            title={!isAuthenticated() ? 'Please log in to download' : 'Download from GitHub'}
                          >
                            <FaGithub />
                            {isAuthenticated() ? 'Download from GitHub' : 'Login to Download'}
                          </button>
                        ) : (
                          // Non-premium: No GitHub URL, view-only for guests
                          <button
                            onClick={() => handleRepoDownload(repo)}
                            className={`flex-1 flex items-center justify-center gap-2 font-medium py-2 px-4 rounded transition duration-200 ${
                              isAuthenticated() && repo.downloadUrl
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                            disabled={!isAuthenticated() || !repo.downloadUrl}
                            title={!isAuthenticated() ? 'View-only for guests. Please log in to download.' : (repo.downloadUrl ? 'Download' : 'Download not available')}
                          >
                            <FaDownload />
                            {isAuthenticated() ? (repo.downloadUrl ? 'Download' : 'View Only') : 'View Only'}
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
                        {isAuthenticated() && (
                          <button
                            onClick={() => handleOpenReview(repo)}
                            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-700 dark:hover:bg-purple-600 text-purple-700 dark:text-purple-300 rounded transition duration-200"
                            title="Review Repository"
                          >
                            <FaStar />
                          </button>
                        )}
                        {isAuthenticated() && (
                          <button
                            onClick={() => {
                              setViewingRepo(repo);
                              setShowViewModal(true);
                            }}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-200 rounded transition duration-200"
                            title="View Details"
                          >
                            <FaEye />
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

      {/* View Repository Details Modal - Only for logged-in users */}
      {isAuthenticated() && showViewModal && viewingRepo && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
          onClick={() => {
            setShowViewModal(false);
            setViewingRepo(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Repository Details</h2>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingRepo(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
          </button>
              </div>
              
              <div className="space-y-6">
                {/* Thumbnail */}
                {viewingRepo.thumbnailUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={getImageUrl(viewingRepo.thumbnailUrl)} 
                      alt={viewingRepo.name} 
                      className="max-w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{viewingRepo.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Version</label>
                    <p className="text-gray-900 dark:text-white">{viewingRepo.version || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Domain</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {viewingRepo.domain || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Access Type</label>
                    {(() => {
                      // Determine access type dynamically
                      let accessType = 'N/A';
                      let badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                      
                      if (viewingRepo.category === 'Premium') {
                        accessType = 'Premium';
                        badgeClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                      } else if (viewingRepo.category === 'Free' && viewingRepo.gitHubUrl) {
                        accessType = 'Free';
                        badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                      } else if (viewingRepo.category === 'Free' && !viewingRepo.gitHubUrl) {
                        accessType = 'Non-Premium';
                        badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                      }
                      
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                          {accessType}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">License</label>
                    <p className="text-gray-900 dark:text-white">{viewingRepo.licenseType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingRepo.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      viewingRepo.status === 'archived' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingRepo.status || 'active'}
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{viewingRepo.description || 'No description provided'}</p>
                </div>
                
                {/* Technologies */}
                {(() => {
                  const technologies = typeof viewingRepo.technologies === 'string' 
                    ? JSON.parse(viewingRepo.technologies || '[]') 
                    : (viewingRepo.technologies || []);
                  
                  return technologies.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Technologies</label>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            <FaTag className="mr-1" />
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
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">GitHub URL</label>
                      <a 
                        href={viewingRepo.gitHubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all flex items-center gap-2"
                      >
                        <FaGithub />
                        {viewingRepo.gitHubUrl}
                      </a>
                    </div>
                  )}
                  {viewingRepo.downloadUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Download URL</label>
                      <a 
                        href={viewingRepo.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all flex items-center gap-2"
                      >
                        <FaDownload />
                        {viewingRepo.downloadUrl}
                      </a>
                    </div>
                  )}
                  {viewingRepo.documentPreviewUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Preview</label>
                      <a 
                        href={getImageUrl(viewingRepo.documentPreviewUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all flex items-center gap-2"
                      >
                        <FaFileAlt />
                        View Document Preview
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stars</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">⭐ {viewingRepo.stars || 0}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Forks</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">🍴 {viewingRepo.forks || 0}</p>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Downloads</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">⬇️ {viewingRepo.downloads || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewingRepo && (
          <div
            className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
            onClick={() => {
              setShowReviewModal(false);
              setReviewingRepo(null);
              setReviewRating(0);
              setReviewComment('');
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Review Repository</h2>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewingRepo(null);
                      setReviewRating(0);
                      setReviewComment('');
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {reviewingRepo.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reviewingRepo.description}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-3xl transition-colors"
                      >
                        {star <= reviewRating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {reviewRating} out of 5 stars
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    rows="4"
                    placeholder="Share your thoughts about this repository..."
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {reviewComment.length}/2000 characters
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewingRepo(null);
                      setReviewRating(0);
                      setReviewComment('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default ProductsPage;
