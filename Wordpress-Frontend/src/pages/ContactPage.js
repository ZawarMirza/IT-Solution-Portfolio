import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    companyName: '',
    country: '',
    howCanWeHelp: '',
    productServiceInterest: '',
    howDidYouHearAboutUs: '',
    consentGiven: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
    'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 
    'Denmark', 'Finland', 'Poland', 'India', 'China', 'Japan', 'South Korea', 
    'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Brazil', 
    'Mexico', 'Argentina', 'Chile', 'South Africa', 'Egypt', 'UAE', 'Saudi Arabia',
    'Other'
  ];

  const productServiceInterests = [
    'Please Select',
    'Web Development',
    'Mobile App Development',
    'Cloud Solutions',
    'AI/ML Services',
    'Data Analytics',
    'Cybersecurity',
    'Consulting',
    'Training',
    'Support & Maintenance',
    'Other'
  ];

  const hearAboutUsOptions = [
    'Please Select',
    'Google Search',
    'Social Media',
    'Referral',
    'Advertisement',
    'Trade Show',
    'Email Marketing',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consentGiven) {
      toast.error('Please consent to the privacy policy to submit the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/Feedbacks', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        workEmail: formData.workEmail,
        companyName: formData.companyName,
        country: formData.country,
        howCanWeHelp: formData.howCanWeHelp,
        productServiceInterest: formData.productServiceInterest,
        howDidYouHearAboutUs: formData.howDidYouHearAboutUs,
        consentGiven: formData.consentGiven
      });

      toast.success('Thank you for your feedback! We will get back to you soon.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        companyName: '',
        country: '',
        howCanWeHelp: '',
        productServiceInterest: '',
        howDidYouHearAboutUs: '',
        consentGiven: false
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero / Banner */}
      <div className="relative h-80 bg-gradient-to-r from-teal-700 via-indigo-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1500&q=80"
            alt="Contact banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact Sales</h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl">
            Have a question, project, or partnership opportunity? Fill out the form and our team will reach out shortly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Work Email */}
              <div>
                <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your work email address"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* How can we help */}
              <div>
                <label htmlFor="howCanWeHelp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How can we help? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="howCanWeHelp"
                  name="howCanWeHelp"
                  value={formData.howCanWeHelp}
                  onChange={handleInputChange}
                  placeholder="What are your requirements?"
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Product/Service Interest */}
              <div>
                <label htmlFor="productServiceInterest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product/Service Interest <span className="text-red-500">*</span>
                </label>
                <select
                  id="productServiceInterest"
                  name="productServiceInterest"
                  value={formData.productServiceInterest}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {productServiceInterests.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* How did you hear about us */}
              <div>
                <label htmlFor="howDidYouHearAboutUs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How did you hear about us? <span className="text-red-500">*</span>
                </label>
                <select
                  id="howDidYouHearAboutUs"
                  name="howDidYouHearAboutUs"
                  value={formData.howDidYouHearAboutUs}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {hearAboutUsOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="mt-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="consentGiven"
                checked={formData.consentGiven}
                onChange={handleInputChange}
                required
                className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                By ticking this box, you are consenting to allow NETSOL to contact you about products, services and offers that may be of interest to you.{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  Privacy policy.
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;

