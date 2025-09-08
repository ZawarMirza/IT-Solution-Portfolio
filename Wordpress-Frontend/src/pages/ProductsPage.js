import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';

function ProductsPage() {
  const location = useLocation();
  
  // State for active filter
  const [activeFilter, setActiveFilter] = useState("All");
  
  // State for products and domains data
  const [productsByDomain, setProductsByDomain] = useState({});
  const [domains, setDomains] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parse query parameters to get the selected domain
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const domainParam = queryParams.get('domain');
    
    if (domainParam && domains.includes(domainParam)) {
      setActiveFilter(domainParam);
    }
  }, [location.search, domains]);

  // Fetch products and domains from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch domains
        const domainsResponse = await axios.get('http://localhost:5119/api/domains');
        const domainNames = domainsResponse.data.map(domain => domain.name);
        setDomains(["All", ...domainNames]);
        
        // Fetch all products
        const productsResponse = await axios.get('http://localhost:5119/api/products');
        const products = productsResponse.data;
        
        // Organize products by domain
        const organizedProducts = {};
        products.forEach(product => {
          const domain = product.domain || 'Other';
          if (!organizedProducts[domain]) {
            organizedProducts[domain] = [];
          }
          organizedProducts[domain].push({
            id: product.id,
            title: product.title,
            caption: product.caption,
            image: product.image
          });
        });
        
        setProductsByDomain(organizedProducts);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false
        }
      }
    ]
  };

  // Filter domains based on active filter
  const getFilteredDomains = () => {
    if (activeFilter === 'All') {
      return Object.keys(productsByDomain);
    }
    return [activeFilter];
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 bg-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-800 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Products Hero" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl animate-fade-in">Our Products</h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            Explore our comprehensive suite of products across various domains, designed to meet your specific business needs.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="py-8 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Filter by Domain</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setActiveFilter(domain)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === domain
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="spinner-border text-indigo-600" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500 dark:text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            getFilteredDomains().map((domain) => (
              <div key={domain} className="mb-16 animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{domain}</h2>
                  <div className="w-20 h-1 bg-indigo-500"></div>
                </div>
                
                <Slider {...sliderSettings}>
                  {productsByDomain[domain]?.map((product) => (
                    <div key={product.id} className="px-2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full transform transition-all hover:shadow-lg duration-300">
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                          />
                        </div>
                        <div className="p-6 dark:text-white">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{product.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.caption}</p>
                          <button className="inline-block bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded transition duration-300">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900 py-16 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 animate-fade-in">Need a Custom Solution?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 animate-slide-up">
            Our team specializes in creating tailored solutions designed to meet your specific business requirements.
            Contact us to discuss how we can help you achieve your goals.
          </p>
          <button className="inline-block bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 animate-bounce-slow">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
