import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import axios from 'axios';

function Header() {
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5119/api/domains');
        const categories = response.data.map(domain => ({
          name: domain.name,
          path: `/products?domain=${encodeURIComponent(domain.name)}`
        }));
        setProductCategories(categories);
      } catch (err) {
        console.error('Error fetching domains:', err);
        setError('Failed to load product categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">IT Solutions</Link>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link to="/" className="hover:text-blue-300 transition duration-300">Home</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-300 transition duration-300">About</Link>
            </li>
            <li className="relative">
              <button 
                className="flex items-center hover:text-blue-300 transition duration-300 focus:outline-none"
                onClick={toggleProductsDropdown}
              >
                Products
                <svg 
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isProductsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white text-gray-800 rounded-md shadow-lg py-2 z-20">
                  <div className="grid grid-cols-2 gap-1">
                    {loading ? (
                      <div className="px-4 py-2 text-center col-span-2">Loading categories...</div>
                    ) : error ? (
                      <div className="px-4 py-2 text-center col-span-2 text-red-500">Error loading categories</div>
                    ) : productCategories.length > 0 ? (
                      productCategories.map((category, index) => (
                        <Link 
                          key={index} 
                          to={category.path} 
                          className="px-4 py-2 hover:bg-gray-100 block"
                          onClick={() => setIsProductsDropdownOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-center col-span-2">No categories available</div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Link 
                      to="/products" 
                      className="px-4 py-2 hover:bg-gray-100 block font-medium text-blue-600"
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              )}
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-300 transition duration-300">Login</Link>
            </li>
            <li>
              <DarkModeToggle />
            </li>
          </ul>
        </nav>
        <div className="md:hidden">
          <button className="focus:outline-none" onClick={toggleMobileMenu}>
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-700 dark:bg-gray-800 shadow-inner">
          <ul className="px-4 py-3">
            <li className="py-2 border-b border-gray-600">
              <Link 
                to="/" 
                className="block hover:text-blue-300 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="py-2 border-b border-gray-600">
              <Link 
                to="/about" 
                className="block hover:text-blue-300 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li className="py-2 border-b border-gray-600">
              <div>
                <button 
                  className="flex items-center w-full justify-between hover:text-blue-300 transition duration-300 focus:outline-none"
                  onClick={toggleProductsDropdown}
                >
                  Products
                  <svg 
                    className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isProductsDropdownOpen && (
                  <div className="pl-4 pt-2">
                    {loading ? (
                      <div className="py-2 text-center text-gray-300">Loading categories...</div>
                    ) : error ? (
                      <div className="py-2 text-center text-red-400">Error loading categories</div>
                    ) : productCategories.length > 0 ? (
                      productCategories.map((category, index) => (
                        <Link 
                          key={index} 
                          to={category.path} 
                          className="block py-2 text-gray-300 hover:text-blue-300"
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="py-2 text-center text-gray-300">No categories available</div>
                    )}
                    <Link 
                      to="/products" 
                      className="block py-2 font-medium text-blue-400 hover:text-blue-300"
                      onClick={() => {
                        setIsProductsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      View All Products
                    </Link>
                  </div>
                )}
              </div>
            </li>
            <li className="py-2 border-b border-gray-600">
              <Link 
                to="/login" 
                className="block hover:text-blue-300 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>
            <li className="py-2 flex justify-center mt-2">
              <DarkModeToggle />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;
