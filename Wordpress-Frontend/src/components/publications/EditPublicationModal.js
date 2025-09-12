import React, { useState, useEffect } from 'react';

const EditPublicationModal = ({ isOpen, onClose, onSave, publication, domains }) => {
    const [formData, setFormData] = useState({
        title: '',
        authors: [{ name: '' }],
        domain: '',
        abstract: '',
        publishedDate: '',
        status: 'published',
        keywords: []
    });
    const [files, setFiles] = useState({});

    // Initialize form data when publication prop changes
    useEffect(() => {
        if (publication) {
            setFormData({
                title: publication.title || '',
                authors: publication.authors || [{ name: '' }],
                domain: publication.domain || '',
                abstract: publication.abstract || '',
                publishedDate: publication.publishedDate ? 
                    publication.publishedDate.split('T')[0] : '',
                status: publication.status || 'published',
                keywords: publication.keywords || []
            });
        }
    }, [publication]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        if (formData.authors.length > 1) {
            const newAuthors = formData.authors.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                authors: newAuthors
            }));
        }
    };

    const handleKeywordsChange = (e) => {
        const keywords = e.target.value.split(',').map(k => k.trim());
        setFormData(prev => ({
            ...prev,
            keywords: keywords.filter(k => k !== '')
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            files
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Edit Publication
                        </h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Authors *
                            </label>
                            {formData.authors.map((author, index) => (
                                <div key={index} className="flex mb-2">
                                    <input
                                        type="text"
                                        value={author.name}
                                        onChange={(e) => handleAuthorChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder={`Author ${index + 1} name`}
                                        required
                                    />
                                    {formData.authors.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAuthor(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAuthor}
                                className="mt-2 px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            >
                                + Add Another Author
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Domain *
                            </label>
                            <select
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Select a domain</option>
                                {domains.map((domain) => (
                                    <option key={domain} value={domain}>
                                        {domain}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Abstract
                            </label>
                            <textarea
                                name="abstract"
                                value={formData.abstract}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Published Date
                                </label>
                                <input
                                    type="date"
                                    name="publishedDate"
                                    value={formData.publishedDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Keywords (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.keywords.join(', ')}
                                onChange={handleKeywordsChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Thumbnail Image
                                </label>
                                <input
                                    type="file"
                                    name="thumbnail"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-indigo-300 dark:hover:file:bg-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Document File (PDF)
                                </label>
                                <input
                                    type="file"
                                    name="document"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-indigo-300 dark:hover:file:bg-gray-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPublicationModal;
