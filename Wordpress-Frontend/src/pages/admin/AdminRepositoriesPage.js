import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const AdminRepositoriesPage = () => {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRepositories = async () => {
            setLoading(true);
            setError(null);
            try {
                // This would be your repositories API endpoint
                // const response = await axios.get('http://localhost:5119/api/repositories');
                // setRepositories(response.data);
                
                // For now, using mock data
                setRepositories([
                    {
                        id: 1,
                        name: 'wordpress-portfolio',
                        description: 'A modern WordPress portfolio application built with React and ASP.NET Core',
                        language: 'JavaScript',
                        stars: 45,
                        forks: 12,
                        visibility: 'Public',
                        createdAt: '2024-01-10'
                    },
                    {
                        id: 2,
                        name: 'react-components-library',
                        description: 'Reusable React components for modern web applications',
                        language: 'TypeScript',
                        stars: 23,
                        forks: 5,
                        visibility: 'Public',
                        createdAt: '2024-02-05'
                    },
                    {
                        id: 3,
                        name: 'api-backend-service',
                        description: 'RESTful API backend service with authentication and authorization',
                        language: 'C#',
                        stars: 18,
                        forks: 3,
                        visibility: 'Private',
                        createdAt: '2024-01-25'
                    }
                ]);
            } catch (err) {
                console.error('Error fetching repositories:', err);
                setError('Failed to load repositories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRepositories();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Repositories</h1>
                <div className="text-center p-10">Loading repositories...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Repositories</h1>
                <div className="text-center text-red-600 p-10">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <Helmet>
                <title>Admin Repositories - Wordpress Portfolio</title>
                <meta name="description" content="Admin panel for managing repositories in the Wordpress Portfolio application." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Repositories</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                    Add New Repository
                </button>
            </div>

            {/* Repositories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.length > 0 ? (
                    repositories.map((repo) => (
                        <div key={repo.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {repo.name}
                                </h3>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    repo.visibility === 'Public' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {repo.visibility}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {repo.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                                    {repo.language}
                                </span>
                                <div className="flex space-x-4">
                                    <span className="flex items-center">
                                        ⭐ {repo.stars}
                                    </span>
                                    <span className="flex items-center">
                                        🍴 {repo.forks}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                                Created: {new Date(repo.createdAt).toLocaleDateString()}
                            </div>
                            
                            <div className="flex space-x-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition duration-200">
                                    View
                                </button>
                                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition duration-200">
                                    Edit
                                </button>
                                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition duration-200">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                        No repositories found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRepositoriesPage;
