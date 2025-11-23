import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ email: '', userName: '', firstName: '', lastName: '', role: '' });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/Users/${id}`);
        // Refresh users after deletion
        const usersResponse = await api.get('/Users');
        const mappedUsers = usersResponse.data.map(user => ({
          id: user.id,
          email: user.email,
          userName: user.userName || user.email?.split('@')[0] || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles || [],
          role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
          isBlocked: user.isBlocked || false,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user.');
      }
    }
  };

  const handleOpenBlockModal = (user) => {
    setUserToBlock(user);
    setBlockReason('');
    setShowBlockModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setUserToBlock(null);
    setBlockReason('');
    document.body.style.overflow = 'auto';
  };

  const handleBlockUser = async () => {
    if (!userToBlock) return;
    
    if (!blockReason.trim()) {
      toast.error('Please provide a reason for blocking this user');
      return;
    }

    try {
      await api.put(`/Users/${userToBlock.id}/block`, {
        Reason: blockReason.trim()
      });
      
      toast.success('User blocked successfully. An email notification has been sent.');
      
      // Refresh users after blocking
      const usersResponse = await api.get('/Users');
      const mappedUsers = usersResponse.data.map(user => ({
        id: user.id,
        email: user.email,
        userName: user.userName || user.email?.split('@')[0] || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || [],
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
        isBlocked: user.isBlocked || false,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt,
        blockedBy: user.blockedBy,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      setUsers(mappedUsers);
      handleCloseBlockModal();
    } catch (err) {
      console.error('Error blocking user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to block user.';
      toast.error(errorMessage);
    }
  };

  const handleUnblockUser = async (id) => {
    if (!window.confirm('Are you sure you want to unblock this user? An email notification will be sent to the user.')) {
      return;
    }

    try {
      await api.put(`/Users/${id}/unblock`, {});
      toast.success('User unblocked successfully. An email notification has been sent.');
      
      // Refresh users after unblocking
      const usersResponse = await api.get('/Users');
      const mappedUsers = usersResponse.data.map(user => ({
        id: user.id,
        email: user.email,
        userName: user.userName || user.email?.split('@')[0] || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || [],
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
        isBlocked: user.isBlocked || false,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt,
        blockedBy: user.blockedBy,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error unblocking user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to unblock user.';
      toast.error(errorMessage);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/Users/${userId}/role`, { role: newRole });
      // Refresh users after role update
      const usersResponse = await api.get('/Users');
      const mappedUsers = usersResponse.data.map(user => ({
        id: user.id,
        email: user.email,
        userName: user.userName || user.email?.split('@')[0] || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || [],
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
        isBlocked: user.isBlocked || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({ 
      email: user.email || '', 
      userName: user.userName || user.email?.split('@')[0] || '',
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    });
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
      await api.put(`/auth/users/${editingUser.id}`, editFormData);
      setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...editFormData } : user));
      setEditingUser(null);
      setEditFormData({ email: '', userName: '', firstName: '', lastName: '' });
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
    setEditFormData({ email: '', userName: '', firstName: '', lastName: '' });
  };

  const handleOpenAddModal = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User'
    });
    setShowAddModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.firstName || !newUser.lastName) {
      toast.error('First name and last name are required');
      return;
    }
    
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required');
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the register endpoint to create a new user
      const response = await api.post('/auth/register', {
        FirstName: newUser.firstName,
        LastName: newUser.lastName,
        Email: newUser.email,
        Password: newUser.password,
        ConfirmPassword: newUser.confirmPassword,
        Role: newUser.role || 'User'
      });

      toast.success('User created successfully!');
      
      // Refresh users list to get the new user with ID
      await fetchData();
      
      // Find the newly created user and update role/email confirmation if needed
      const updatedUsersResponse = await api.get('/Users');
      const createdUser = updatedUsersResponse.data.find(u => u.email === newUser.email);
      
      if (createdUser) {
        // Update role if it's different from default
        if (newUser.role && newUser.role !== 'User') {
          try {
            await api.put(`/Users/${createdUser.id}/role`, { role: newUser.role });
            toast.success(`User role set to ${newUser.role}`);
          } catch (roleErr) {
            console.error('Error setting user role:', roleErr);
            toast.error('User created but role assignment failed');
          }
        }
        
        // Note: Email confirmation would need a separate endpoint to set EmailConfirmed=true
        // For now, the user will need to verify their email (or we can add that endpoint later)
      }
      
      // Refresh users list again to show updated data
      await fetchData();
      handleCloseAddModal();
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err.response?.data?.message || 
                          (err.response?.data?.errors && Object.values(err.response.data.errors).flat()[0]) ||
                          'Failed to create user. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log current auth state for debugging
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Current user from localStorage:', storedUser ? JSON.parse(storedUser) : 'None');
      console.log('Token exists:', !!storedToken);
      
      // ProtectedRoute should handle authentication, so we just log and continue
      if (!storedToken) {
        console.warn('No token found - ProtectedRoute should have redirected');
        // Don't set error or redirect - ProtectedRoute will handle it
        setLoading(false);
        return;
      }

      // First, check debug info to see what's in the token
      try {
        const debugResponse = await api.get('/Users/debug');
        console.log('Token Debug Info:', debugResponse.data);
        if (!debugResponse.data.isAdmin) {
          console.warn('User is not an Admin! Roles:', debugResponse.data.roles);
          setError(`You are not an Admin. Your roles: ${debugResponse.data.roles?.join(', ') || 'None'}. Please log out and log back in as an admin.`);
          setLoading(false);
          return;
        }
      } catch (debugErr) {
        console.warn('Could not fetch debug info:', debugErr);
        console.warn('Debug error response:', debugErr.response?.data);
        // If it's a 401, the token might be invalid - but don't redirect, let the main error handler deal with it
        if (debugErr.response?.status === 401) {
          console.warn('Token appears to be invalid (401 from debug endpoint)');
          // Continue to try the main request - it will handle the error
        }
        // Continue anyway for other errors
      }

      // Fetch users, roles, and stats in parallel using the configured api instance
      const [usersResponse, rolesResponse, statsResponse] = await Promise.all([
        api.get('/Users'),
        api.get('/Users/roles'),
        api.get('/Users/stats')
      ]);

      // Map backend response to frontend format
      const mappedUsers = usersResponse.data.map(user => ({
        id: user.id,
        email: user.email,
        userName: user.userName || user.email?.split('@')[0] || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || [],
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
        isBlocked: user.isBlocked || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      
      setUsers(mappedUsers);
      setAvailableRoles(rolesResponse.data);
      setUserStats(statsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      if (err.response && err.response.status === 401) {
        setError('Access denied. Please log in as an admin. Your session may have expired.');
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response && err.response.status === 403) {
        const errorData = err.response.data;
        console.error('403 Error details:', errorData);
        setError(`Permission denied. Admin privileges required. ${errorData?.message || ''} ${errorData?.roles ? `Your roles: ${errorData.roles.join(', ')}` : ''}`);
      } else {
        setError(`Failed to load data: ${err.response?.data?.message || err.message || 'Please try again.'}`);
      }
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
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out"
        >
          Add New User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition duration-200 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                        : user.userName || user.email?.split('@')[0] || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'User' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.roles && user.roles.length > 0 ? user.roles.join(', ') : user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                          title="Edit User"
                        >
                          Edit
                        </button>
                        {user.isBlocked ? (
                          <button 
                            onClick={() => handleUnblockUser(user.id)}
                            className="bg-green-100 text-green-800 hover:bg-green-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                            title="Unblock User"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenBlockModal(user)}
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                            title="Block User"
                          >
                            Block
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium py-1 px-2 rounded transition duration-200 ease-in-out"
                          title="Delete User"
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
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseAddModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Add New User</h3>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleNewUserInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleNewUserInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleNewUserInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleNewUserInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && userToBlock && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseBlockModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Block User</h3>
                <button
                  onClick={handleCloseBlockModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>User:</strong> {userToBlock.firstName || userToBlock.lastName 
                    ? `${userToBlock.firstName || ''} ${userToBlock.lastName || ''}`.trim() 
                    : userToBlock.userName || userToBlock.email}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Email:</strong> {userToBlock.email}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="blockReason"
                  name="blockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="Enter the reason for blocking this user. This will be sent to the user via email."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This reason will be included in the email notification sent to the user.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Warning:</strong> Blocking this user will prevent them from accessing their account. 
                  An email notification will be sent to {userToBlock.email} with the reason you provide.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseBlockModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={!blockReason.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Block User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
