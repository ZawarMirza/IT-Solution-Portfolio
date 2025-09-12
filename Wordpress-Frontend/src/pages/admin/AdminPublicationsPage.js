import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import AddPublicationModal from '../../components/publications/AddPublicationModal';
import EditPublicationModal from '../../components/publications/EditPublicationModal';

const AdminPublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPublication, setCurrentPublication] = useState(null);
    const [domains, setDomains] = useState(['All']);

    // Fetch domains and publications on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch domains
            try {
                const domainsResponse = await api.get('/domains');
                setDomains(['All', ...domainsResponse.data.map(d => d.name)]);
            } catch (err) {
                console.error('Error fetching domains:', err);
            }
            
            // Fetch publications
            try {
                const response = await api.get('/Publications');
                setPublications(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching publications:', err);
                setError('Failed to load publications. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this publication?')) {
            try {
                await api.delete(`/Publications/${id}`);
                setPublications(publications.filter(pub => pub.id !== id));
            } catch (err) {
                console.error('Error deleting publication:', err);
                setError('Failed to delete publication.');
            }
        }
    };

    const handleEdit = (publication) => {
        // Parse authors from JSON string to array of objects
        let authors = [];
        try {
            authors = JSON.parse(publication.authors || '[]').map(name => ({ name }));
        } catch (e) {
            console.error('Error parsing authors:', e);
            authors = [{ name: '' }];
        }

        // Parse keywords from JSON string to array
        let keywords = [];
        try {
            keywords = JSON.parse(publication.keywords || '[]');
        } catch (e) {
            console.error('Error parsing keywords:', e);
            keywords = [];
        }

        setCurrentPublication({
            ...publication,
            authors,
            keywords
        });
        setIsEditModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Publications</h1>
                <div className="text-center p-10">Loading publications...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Publications</h1>
                <div className="text-center text-red-600 p-10">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <Helmet>
                <title>Admin Publications - Wordpress Portfolio</title>
                <meta name="description" content="Admin panel for managing publications in the Wordpress Portfolio application." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Publications</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    Add New Publication
                </button>
            </div>

            {/* Publications Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Downloads
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {publications.length > 0 ? (
                            publications.map((publication) => (
                                <tr key={publication.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {publication.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {JSON.parse(publication.authors || '[]').join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            publication.status === 'published' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                : publication.status === 'draft'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                        }`}>
                                            {publication.status.charAt(0).toUpperCase() + publication.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {publication.downloads}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(publication.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => handleEdit(publication)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(publication.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No publications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Publication Modal */}
            <AddPublicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={async (publicationData) => {
                    try {
                        // Prepare the publication data
                        const { files, ...publication } = publicationData;
                        
                        // Ensure all required fields have values
                        if (!publication.title) {
                            throw new Error('Title is required');
                        }
                        
                        // Format authors as JSON string
                        const authorNames = (publication.authors || [])
                            .map(author => author?.name || '')
                            .filter(name => name.trim() !== '');
                            
                        if (authorNames.length === 0) {
                            throw new Error('At least one author is required');
                        }
                        
                        publication.authors = JSON.stringify(authorNames);
                        
                        // Format keywords as JSON string
                        if (!Array.isArray(publication.keywords)) {
                            publication.keywords = [];
                        }
                        publication.keywords = JSON.stringify(publication.keywords.filter(k => k));
                        
                        // Set default values for required fields
                        publication.status = publication.status || 'published';
                        publication.downloads = publication.downloads || 0;
                        
                        // Ensure domain is set
                        if (!publication.domain && domains.length > 1) {
                            publication.domain = domains[1]; // Use first non-'All' domain
                        }
                        
                        if (!publication.domain) {
                            throw new Error('Domain is required');
                        }
                        
                        // Convert date to ISO string
                        if (publication.publishedDate) {
                            publication.publishedDate = new Date(publication.publishedDate).toISOString();
                        } else {
                            publication.publishedDate = new Date().toISOString();
                        }
                        
                        // Log publication data before sending
                        console.log('Sending publication data:', JSON.stringify(publication, null, 2));
                        
                        // First, create the publication
                        const response = await api.post('/Publications', publication)
                            .catch(error => {
                                console.error('Publication creation error:', error);
                                throw error;
                            });
                        
                        // If there are files, upload them separately
                        if (files) {
                            const formData = new FormData();
                            let hasFiles = false;
                            
                            Object.entries(files).forEach(([fileKey, file]) => {
                                if (file) {
                                    formData.append(fileKey, file);
                                    hasFiles = true;
                                }
                            });
                            
                            if (hasFiles) {
                                await api.post(`/Publications/${response.data.id}/files`, formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                });
                            }
                        }
                        
                        // Refresh the publications list to ensure we have the latest data
                        const updatedResponse = await api.get('/Publications');
                        setPublications(updatedResponse.data);
                        
                        // Show success message
                        alert('Publication added successfully!');
                        setIsAddModalOpen(false);
                    } catch (error) {
                        console.error('Error adding publication:', error);
                        console.log('Response data:', error.response?.data);
                        
                        let errorMessage = 'Failed to add publication';
                        if (error.response?.data) {
                            if (typeof error.response.data === 'string') {
                                errorMessage += `: ${error.response.data}`;
                            } else if (error.response.data.errors) {
                                // Handle validation errors
                                const errorDetails = Object.entries(error.response.data.errors)
                                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                                    .join('\n');
                                errorMessage += `:\n${errorDetails}`;
                            } else if (error.response.data.title) {
                                errorMessage += `: ${error.response.data.title}`;
                            } else {
                                errorMessage += `: ${JSON.stringify(error.response.data)}`;
                            }
                        } else {
                            errorMessage += `: ${error.message}`;
                        }
                        alert(errorMessage);
                    }
                }}
                domains={domains.filter(d => d !== 'All')}
            />
            
            {/* Edit Publication Modal */}
            {currentPublication && (
                <EditPublicationModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={async (updatedData) => {
                        try {
                            // Prepare the updated publication data
                            const { files, ...publication } = updatedData;
                            
                            // Format authors as JSON string
                            const authorNames = (publication.authors || [])
                                .map(author => author?.name || '')
                                .filter(name => name.trim() !== '');
                                
                            if (authorNames.length === 0) {
                                throw new Error('At least one author is required');
                            }
                            
                            publication.authors = JSON.stringify(authorNames);
                            
                            // Format keywords as JSON string
                            if (!Array.isArray(publication.keywords)) {
                                publication.keywords = [];
                            }
                            publication.keywords = JSON.stringify(publication.keywords.filter(k => k));
                            
                            // Prepare the update data with required fields
                            const updateData = {
                                ...publication,
                                id: currentPublication.id,
                                // Preserve the original creation data
                                createdAt: currentPublication.createdAt,
                                createdBy: currentPublication.createdBy,
                                // Ensure updatedAt is set
                                updatedAt: new Date().toISOString()
                            };
                            
                            console.log('Sending update for publication:', updateData);
                            
                            // Update the publication
                            const response = await api.put(
                                `/Publications/${currentPublication.id}`, 
                                updateData
                            ).catch(error => {
                                console.error('Update error details:', {
                                    status: error.response?.status,
                                    statusText: error.response?.statusText,
                                    data: error.response?.data,
                                    headers: error.response?.headers,
                                    requestData: updateData
                                });
                                throw error;
                            });
                            
                            // If there are files, upload them separately
                            if (files) {
                                const formData = new FormData();
                                let hasFiles = false;
                                
                                Object.entries(files).forEach(([fileKey, file]) => {
                                    if (file) {
                                        formData.append(fileKey, file);
                                        hasFiles = true;
                                    }
                                });
                                
                                if (hasFiles) {
                                    await api.post(
                                        `/Publications/${currentPublication.id}/files`, 
                                        formData, 
                                        { headers: { 'Content-Type': 'multipart/form-data' } }
                                    );
                                }
                            }
                            
                            // Refresh the publications list
                            const updatedResponse = await api.get('/Publications');
                            setPublications(updatedResponse.data);
                            
                            alert('Publication updated successfully!');
                            setIsEditModalOpen(false);
                        } catch (error) {
                            console.error('Error updating publication:', error);
                            alert(`Failed to update publication: ${error.response?.data?.message || error.message}`);
                        }
                    }}
                    publication={currentPublication}
                    domains={domains.filter(d => d !== 'All')}
                />
            )}
        </div>
    );
};

export default AdminPublicationsPage;
