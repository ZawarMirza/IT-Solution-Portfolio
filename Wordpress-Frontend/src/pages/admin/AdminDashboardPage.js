import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalDomains: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch users count
                const usersResponse = await axios.get('http://localhost:5119/api/auth/users');
                const totalUsers = usersResponse.data.length;

                // Fetch domains count
                const domainsResponse = await axios.get('http://localhost:5119/api/domains');
                const totalDomains = domainsResponse.data.length;

                // Fetch products count using the specific count endpoint
                let totalProducts = 0;
                try {
                    const countResponse = await axios.get('http://localhost:5119/api/products/count');
                    console.log('Products count response:', countResponse.data);
                    totalProducts = countResponse.data;
                } catch (err) {
                    console.error('Products count endpoint error:', err.message, err.response ? err.response.data : 'No response data');
                }

                setStats({ totalUsers, totalProducts, totalDomains });

                // Set recent users (limit to 3 most recent)
                const sortedUsers = usersResponse.data.sort((a, b) => new Date(b.createdAt || '1970-01-01') - new Date(a.createdAt || '1970-01-01'));
                setRecentUsers(sortedUsers.slice(0, 3).map(user => ({
                    id: user.id,
                    username: user.userName || 'N/A',
                    email: user.email || 'N/A',
                    date: user.createdAt || 'N/A'
                })));

                // Set recent products if available using the specific recent endpoint
                if (totalProducts > 0) {
                    try {
                        const recentResponse = await axios.get('http://localhost:5119/api/products/recent?limit=3');
                        console.log('Recent products response:', recentResponse.data);
                        const sortedProducts = recentResponse.data.sort((a, b) => new Date(b.createdAt || '1970-01-01') - new Date(a.createdAt || '1970-01-01'));
                        setRecentProducts(sortedProducts.map(product => ({
                            id: product.id,
                            title: product.title || 'Untitled Product',
                            author: product.createdBy || 'N/A',
                            date: product.createdAt || 'N/A'
                        })));
                    } catch (err) {
                        console.error('Error fetching recent products:', err.message, err.response ? err.response.data : 'No response data');
                        setRecentProducts([]);
                        // Do not set general error to avoid overriding dashboard data display
                    }
                } else {
                    setRecentProducts([]);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
                <div className="text-center p-10">Loading dashboard data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
                <div className="text-center text-red-600 p-10">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <Helmet>
                <title>Admin Dashboard - Wordpress Portfolio</title>
                <meta name="description" content="Admin dashboard for managing users, products, and domains in the Wordpress Portfolio application." />
                <meta name="keywords" content="admin, dashboard, wordpress, portfolio, manage users, manage products, manage domains" />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">Admin Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-lg transition duration-200 ease-in-out">
                    <h2 className="text-lg text-gray-600 dark:text-gray-400">Total Users</h2>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
                    <Link to="/admin/users" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2 transition duration-200 ease-in-out">View All</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-lg transition duration-200 ease-in-out">
                    <h2 className="text-lg text-gray-600 dark:text-gray-400">Total Products</h2>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalProducts}</p>
                    <Link to="/admin/products" className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mt-2 transition duration-200 ease-in-out">View All</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-lg transition duration-200 ease-in-out">
                    <h2 className="text-lg text-gray-600 dark:text-gray-400">Total Domains</h2>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalDomains}</p>
                    <Link to="/admin/domains" className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mt-2 transition duration-200 ease-in-out">View All</Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition duration-200 ease-in-out">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Users</h2>
                    <div className="space-y-4">
                        {recentUsers.length > 0 ? (
                            recentUsers.map(user => (
                                <div key={user.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{user.username}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">Joined: {user.date !== 'N/A' ? new Date(user.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                        )}
                    </div>
                    <Link to="/admin/users" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-4 block text-center transition duration-200 ease-in-out">See All Users</Link>
                </div>

                {/* Recent Products */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition duration-200 ease-in-out">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Products</h2>
                    <div className="space-y-4">
                        {recentProducts.length > 0 ? (
                            recentProducts.map(product => (
                                <div key={product.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{product.title}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">By: {product.author}</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">Created: {product.date !== 'N/A' ? new Date(product.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No products available at the moment. The endpoint might not be accessible.</p>
                        )}
                    </div>
                    <Link to="/admin/products" className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mt-4 block text-center transition duration-200 ease-in-out">See All Products</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
