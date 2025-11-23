import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [categoryInput, setCategoryInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const categoryRef = useRef(null);
  const domainRef = useRef(null);

  const categories = ['Products', 'Solutions', 'Publications', 'Repositories'];

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await api.get('/domains');
        const domainNames = response.data.map(d => d.name);
        setDomains(domainNames);
      } catch (err) {
        console.error('Error fetching domains:', err);
      }
    };
    fetchDomains();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (domainRef.current && !domainRef.current.contains(event.target)) {
        setShowDomainDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (selectedCategory) => {
    setCategoryInput(selectedCategory);
    setShowCategoryDropdown(false);
  };

  const handleDomainSelect = (selectedDomain) => {
    setDomainInput(selectedDomain);
    setShowDomainDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!categoryInput.trim()) {
      alert('Please select or enter a category');
      return;
    }

    // Navigate to products page with search parameters
    const params = new URLSearchParams();
    params.set('category', categoryInput);
    if (domainInput.trim()) {
      params.set('domain', domainInput);
    }
    
    navigate(`/products?${params.toString()}`);
  };

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categoryInput.toLowerCase())
  );

  const filteredDomains = domains.filter(dom =>
    dom.toLowerCase().includes(domainInput.toLowerCase())
  );

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      {/* Category Input */}
      <div className="relative" ref={categoryRef}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => {
              setCategoryInput(e.target.value);
              setShowCategoryDropdown(true);
            }}
            onFocus={() => setShowCategoryDropdown(true)}
            placeholder="Products"
            className="w-40 md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
          />
        </div>
        {showCategoryDropdown && filteredCategories.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Domain Input */}
      <div className="relative" ref={domainRef}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={domainInput}
            onChange={(e) => {
              setDomainInput(e.target.value);
              setShowDomainDropdown(true);
            }}
            onFocus={() => setShowDomainDropdown(true)}
            placeholder="Data Science"
            className="w-40 md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
          />
        </div>
        {showDomainDropdown && filteredDomains.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredDomains.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => handleDomainSelect(dom)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border border-blue-700 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  );
};

export default GlobalSearch;

