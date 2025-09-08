import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDomainsPage = () => {
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState({ name: '' });
    const [editingDomain, setEditingDomain] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDomains = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5119/api/domains');
                setDomains(response.data);
            } catch (err) {
                setError('Failed to fetch domains. Please try again later.');
                console.error('Error fetching domains:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDomains();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDomain(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this domain? This action cannot be undone and may affect associated products.')) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5119/api/domains/${id}`);
                setDomains(domains.filter(domain => domain.id !== id));
                alert('Domain deleted successfully');
            } catch (err) {
                console.error('Error deleting domain:', err);
                alert('Failed to delete domain. It might be in use or there was a server error.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddDomain = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingDomain) {
                const response = await axios.put(`http://localhost:5119/api/domains/${editingDomain.id}`, { id: editingDomain.id, name: newDomain.name });
                setDomains(domains.map(d => d.id === editingDomain.id ? response.data : d));
                setEditingDomain(null);
                alert('Domain updated successfully');
            } else {
                const response = await axios.post('http://localhost:5119/api/domains', { name: newDomain.name });
                setDomains([...domains, response.data]);
                alert('Domain added successfully');
            }
            setNewDomain({ name: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Error saving domain:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(`Failed to save domain. Status: ${err.response.status}. Message: ${err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
                console.error('Request:', err.request);
                setError('Failed to save domain. No response received from server.');
            } else {
                console.error('Error message:', err.message);
                setError(`Failed to save domain. Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditDomain = (domain) => {
        setNewDomain({ name: domain.name });
        setEditingDomain(domain);
        setShowForm(true);
    };

    const handleCancel = () => {
        setNewDomain({ name: '' });
        setEditingDomain(null);
        setShowForm(false);
    };

    if (loading && domains.length === 0) {
        return <div className="container mx-auto px-4 py-8 min-h-screen">Loading domains...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Manage Domains</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">Here you can add, edit, or delete domains (categories) for organizing products.</p>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="mb-6 flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Domains: {domains.length}</span>
                    <button 
                        onClick={() => setShowForm(true)} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out"
                    >
                        + Add New Domain
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleAddDomain} className="mb-6 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{editingDomain ? 'Edit Domain' : 'Add New Domain'}</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">Domain Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={newDomain.name} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white" 
                                required 
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                type="submit" 
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out"
                                disabled={loading}
                            >
                                {editingDomain ? 'Update Domain' : 'Add Domain'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel} 
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th className="py-3 px-4 border-b dark:border-gray-600">ID</th>
                                <th className="py-3 px-4 border-b dark:border-gray-600">Name</th>
                                <th className="py-3 px-4 border-b dark:border-gray-600">Created At</th>
                                <th className="py-3 px-4 border-b dark:border-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map(domain => (
                                <tr key={domain.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 ease-in-out">
                                    <td className="py-3 px-4 text-gray-900 dark:text-white">{domain.id}</td>
                                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{domain.name}</td>
                                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="py-3 px-4">
                                        <button 
                                            onClick={() => handleEditDomain(domain)} 
                                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200 ease-in-out mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(domain.id)} 
                                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition duration-200 ease-in-out"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {domains.length === 0 && !loading && (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">No domains found. Add a new domain to get started.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDomainsPage;
