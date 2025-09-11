import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ email: '', userName: '', role: '' });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userStats, setUserStats] = useState(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-5 h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (editingUser) {
    return (
      <div className="container mx-auto p-5 max-w-4xl dark:bg-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-5">Edit User: {editingUser.email || 'N/A'}</h1>
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
        {error && <div className="text-red-600 dark:text-red-400 mb-3">{error}</div>}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <Link to="/admin/users/add" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out">
          Add New User
        </Link>
      </div>

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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role || 'User'}</td>
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
    </div>
  );
};

export default AdminUsersPage;
