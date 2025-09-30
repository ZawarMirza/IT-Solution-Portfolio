import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ email: '', userName: '', role: '' });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userStats, setUserStats] = useState(null);
  // Add user modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch users, roles, and stats in parallel
        const [usersResponse, rolesResponse, statsResponse] = await Promise.all([
          axios.get('http://localhost:5119/api/Users', { headers }),
          axios.get('http://localhost:5119/api/Users/roles', { headers }),
          axios.get('http://localhost:5119/api/Users/stats', { headers })
        ]);

        setUsers(usersResponse.data);
        setAvailableRoles(rolesResponse.data);
        setUserStats(statsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response && err.response.status === 401) {
          setError('Access denied. Please log in as an admin.');
        } else if (err.response && err.response.status === 403) {
          setError('Permission denied. Admin privileges required.');
        } else {
          setError('Failed to load data. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5119/api/Users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user.');
      }
    }
  };

  const handleBlockUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5119/api/Users/${id}/block`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users.map(user => 
        user.id === id ? { ...user, isBlocked: true } : user
      ));
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user.');
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5119/api/Users/${id}/unblock`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users.map(user => 
        user.id === id ? { ...user, isBlocked: false } : user
      ));
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user.');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5119/api/Users/${userId}/role`, 
        { role: newRole },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUsers(users.map(user => 
        user.id === userId ? { ...user, roles: [newRole] } : user
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({ email: user.email || '', userName: user.userName || '' });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editFormData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:5119/api/auth/users/${editingUser.id}`, editFormData);
      setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...editFormData } : user));
      setEditingUser(null);
      setEditFormData({ email: '', userName: '' });
      alert('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({ email: '', userName: '' });
  };

  // Add user handlers
  const openAddModal = () => {
    setError(null);
    setAddFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', role: availableRoles?.[0] || 'User' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    if (!addFormData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!addFormData.password || addFormData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (addFormData.password !== addFormData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // Registration does not require admin token
      const payload = {
        email: addFormData.email,
        password: addFormData.password,
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        role: addFormData.role || 'User'
      };
      await axios.post('http://localhost:5119/api/auth/register', payload);

      // Refresh the users list with admin token
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const usersResponse = await axios.get('http://localhost:5119/api/Users', { headers });
      setUsers(usersResponse.data);
      setIsAddModalOpen(false);
      alert('User created successfully');
    } catch (err) {
      console.error('Error creating user:', err);
      const apiMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
      setError(apiMsg || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-5 h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && !isAddModalOpen && !editingUser) {
    return (
      <div className="container mx-auto p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => setError(null)} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (editingUser) {
    return (
      <div className="container mx-auto p-5 max-w-4xl dark:bg-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-5">Edit User: {editingUser.email || 'N/A'}</h1>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleUpdateUser} className="mb-5 bg-white dark:bg-gray-800 p-5 rounded shadow-md">
          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={editFormData.email} 
              onChange={handleEditInputChange} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="userName">Username</label>
            <input 
              type="text" 
              id="userName" 
              name="userName" 
              value={editFormData.userName} 
              onChange={handleEditInputChange} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-green-100 text-green-800 hover:bg-green-200 text-sm font-medium py-2 px-4 rounded transition duration-200 ease-in-out">Save Changes</button>
            <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-medium py-2 px-4 rounded transition duration-200 ease-in-out dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <button onClick={openAddModal} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out">
          Add New User
        </button>
      </div>

      {error && !isAddModalOpen && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition duration-200 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role || user.roles?.[0] || 'User'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={addFormData.email}
                  onChange={handleAddInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={addFormData.firstName}
                    onChange={handleAddInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={addFormData.lastName}
                    onChange={handleAddInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={addFormData.confirmPassword}
                    onChange={handleAddInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  name="role"
                  value={addFormData.role}
                  onChange={handleAddInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                >
                  {(availableRoles || []).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={closeAddModal} className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-medium py-2 px-4 rounded transition duration-200 ease-in-out dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition duration-200 ease-in-out">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
