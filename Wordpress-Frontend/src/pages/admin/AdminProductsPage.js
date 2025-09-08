import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ title: '', caption: '', image: '', domainId: 0 });
    const [editingProduct, setEditingProduct] = useState(null);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products and domains from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch products and domains
                const [productsResponse, domainsResponse] = await Promise.all([
                    axios.get('http://localhost:5119/api/products'),
                    axios.get('http://localhost:5119/api/domains')
                ]);
                setProducts(productsResponse.data);
                setDomains(domainsResponse.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products and domains. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.title.trim() || !newProduct.caption.trim() || !newProduct.image.trim() || newProduct.domainId === 0) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Prepare product data with Domain name lookup
            const selectedDomain = domains.find(d => d.id == newProduct.domainId); // Using loose equality to handle string/number comparison
            if (!selectedDomain) {
                setError('Invalid domain selected');
                setLoading(false);
                return;
            }
            const productData = {
                ...newProduct,
                domain: selectedDomain.name,
                id: editingProduct ? editingProduct.id : 0 // Ensure ID matches for updates
            };
            
            if (editingProduct) {
                // Update existing product
                const response = await axios.put(`http://localhost:5119/api/products/${editingProduct.id}`, productData);
                setProducts(products.map(product => product.id === editingProduct.id ? response.data : product));
                setEditingProduct(null);
            } else {
                // Create new product
                const response = await axios.post('http://localhost:5119/api/products', productData);
                setProducts([...products, response.data]);
            }
            setNewProduct({ title: '', caption: '', image: '', domainId: 0 });
        } catch (err) {
            console.error('Error saving product:', err);
            console.error('Error details:', err.response?.data);
            console.error('Status code:', err.response?.status);
            alert(`Failed to save product. Error: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setNewProduct({ title: product.title, caption: product.caption, image: product.image, domainId: product.domainId });
        setEditingProduct(product);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:5119/api/products/${id}`);
                setProducts(products.filter(product => product.id !== id));
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const getDomainName = (id) => {
        if (!id) return 'None';
        const domain = domains.find(d => d.id === parseInt(id));
        return domain ? domain.name : 'None';
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Manage Products</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">Here you can add, edit, or delete products that will be displayed on the user site.</p>
                <div className="w-20 h-1 bg-blue-600 dark:bg-blue-500 mb-6"></div>

                {/* Add/Edit Product Form */}
                <form onSubmit={handleAddOrUpdateProduct} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">Product Title</label>
                            <input 
                                type="text" 
                                id="title" 
                                name="title" 
                                value={newProduct.title} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="caption">Caption</label>
                            <input 
                                type="text" 
                                id="caption" 
                                name="caption" 
                                value={newProduct.caption} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="image">Image URL</label>
                            <input 
                                type="url" 
                                id="image" 
                                name="image" 
                                value={newProduct.image} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="domainId">Domain/Category</label>
                            <select 
                                id="domainId" 
                                name="domainId" 
                                value={newProduct.domainId} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
                                required
                            >
                                <option value="0">Select a Domain</option>
                                {domains.map(domain => (
                                    <option key={domain.id} value={domain.id}>{domain.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                        <button 
                            type="button" 
                            onClick={() => { setEditingProduct(null); setNewProduct({ title: '', caption: '', image: '', domainId: 0 }); }} 
                            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg ml-2 transition duration-300"
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>

                {/* Products List */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="spinner-border text-blue-600" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading products...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-500 dark:text-red-400">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-200 dark:bg-gray-700">
                                    <th className="text-left text-gray-900 dark:text-white px-6 py-3 font-medium">Title</th>
                                    <th className="text-left text-gray-900 dark:text-white px-6 py-3 font-medium">Domain</th>
                                    <th className="text-left text-gray-900 dark:text-white px-6 py-3 font-medium">Created By</th>
                                    <th className="text-left text-gray-900 dark:text-white px-6 py-3 font-medium">Created At</th>
                                    <th className="text-left text-gray-900 dark:text-white px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition duration-200 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.title || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getDomainName(product.domainId) || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.CreatedByUsername || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {product.createdAt && !isNaN(new Date(product.createdAt).getTime()) ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <div className="flex space-x-2">
                                            <button 
                                              onClick={() => handleEditProduct(product)}
                                              className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                                            >
                                              Edit
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteProduct(product.id)}
                                              className="bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProductsPage;
