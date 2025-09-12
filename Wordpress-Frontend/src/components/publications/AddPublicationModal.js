import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiFile, FiVideo, FiImage, FiUser, FiTag } from 'react-icons/fi';

const AddPublicationModal = ({ isOpen, onClose, onSave, domains }) => {
  console.log('AddPublicationModal - isOpen:', isOpen); // Debug log
  const [formData, setFormData] = useState({
    title: '',
    authors: [{ name: '' }],
    domain: '',
    abstract: '',
    keywords: [],
    thumbnail: null,
    document: null,
    video: null,
    publishedDate: new Date().toISOString().split('T')[0]
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = { name: value };
    setFormData(prev => ({
      ...prev,
      authors: newAuthors
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { name: '' }]
    }));
  };

  const removeAuthor = (index) => {
    if (formData.authors.length === 1) return;
    const newAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      authors: newAuthors
    }));
  };

  const addKeyword = (e) => {
    e.preventDefault();
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prepare form data with files
    const submissionData = {
      title: formData.title,
      authors: formData.authors.filter(author => author.name.trim() !== ''),
      domain: formData.domain,
      abstract: formData.abstract,
      keywords: formData.keywords,
      publishedDate: formData.publishedDate,
      files: {
        thumbnail: formData.thumbnail,
        document: formData.document,
        video: formData.video
      }
    };
    
    // Call the onSave prop with the form data
    onSave(submissionData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Add New Publication</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Authors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authors <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.authors.map((author, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => handleAuthorChange(index, e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Author ${index + 1} name`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    disabled={formData.authors.length === 1}
                    className={`p-2 rounded-md ${formData.authors.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAuthor}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-1">+</span> Add another author
              </button>
            </div>
          </div>
          
          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain <span className="text-red-500">*</span>
            </label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a domain</option>
              {domains.filter(d => d !== 'All').map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
          
          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword(e)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a keyword and press Enter"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="flex items-center">
                  <FiUpload className="mr-2 h-4 w-4" />
                  {formData.thumbnail ? formData.thumbnail.name : 'Upload Thumbnail'}
                </span>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>
              {formData.thumbnail && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Recommended size: 800x450px (16:9 aspect ratio)
            </p>
          </div>
          
          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="flex items-center">
                  <FiFile className="mr-2 h-4 w-4" />
                  {formData.document ? formData.document.name : 'Upload Document (PDF)'}
                </span>
                <input
                  type="file"
                  name="document"
                  accept=".pdf"
                  onChange={handleChange}
                  className="sr-only"
                  required
                />
              </label>
              {formData.document && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Preview (Optional)
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="flex items-center">
                  <FiVideo className="mr-2 h-4 w-4" />
                  {formData.video ? formData.video.name : 'Upload Video'}
                </span>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>
              {formData.video && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, video: null }))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          {/* Published Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Published Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="publishedDate"
              value={formData.publishedDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Form Actions */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Publication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPublicationModal;
