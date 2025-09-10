import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const AdminPublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublications = async () => {
            setLoading(true);
            setError(null);
            try {
                // This would be your publications API endpoint
                // const response = await axios.get('http://localhost:5119/api/publications');
                // setPublications(response.data);
                
                // For now, using mock data
                setPublications([
                    {
                        id: 1,
                        title: 'React Best Practices Guide',
                        author: 'Admin User',
                        status: 'Published',
                        downloads: 1250,
                        createdAt: '2024-01-15'
                    },
                    {
                        id: 2,
                        title: 'Modern JavaScript Handbook',
                        author: 'Admin User',
                        status: 'Draft',
                        downloads: 0,
                        createdAt: '2024-02-10'
                    }
                ]);
            } catch (err) {
                console.error('Error fetching publications:', err);
                setError('Failed to load publications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, []);

    if (loading) {
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
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
                                            {publication.author}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            publication.status === 'Published' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                        }`}>
                                            {publication.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {publication.downloads}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(publication.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                            Edit
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
        </div>
    );
};

export default AdminPublicationsPage;
