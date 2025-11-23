import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context';
import api from '../../utils/axiosConfig';
import { FaTrash, FaEnvelope, FaCalendarAlt, FaBuilding, FaGlobe, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminFeedbacksPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchFeedbacks();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Feedbacks');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/Feedbacks/${feedbackId}`);
      toast.success('Feedback deleted successfully');
      fetchFeedbacks();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete feedback';
      toast.error(errorMessage);
    }
  };

  const handleViewFeedback = async (feedbackId) => {
    try {
      const response = await api.get(`/Feedbacks/${feedbackId}`);
      setSelectedFeedback(response.data);
      setShowViewModal(true);
      // Refresh list to update read status
      fetchFeedbacks();
    } catch (err) {
      console.error('Error fetching feedback:', err);
      toast.error('Failed to load feedback details');
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filter === 'read') return feedback.isRead;
    if (filter === 'unread') return !feedback.isRead;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading feedbacks...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Feedbacks</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all feedback submitted through the contact form</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({feedbacks.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Unread ({feedbacks.filter(f => !f.isRead).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'read'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Read ({feedbacks.filter(f => f.isRead).length})
        </button>
      </div>

      {/* Feedbacks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {filter !== 'all' ? 'No feedbacks match your filter' : 'No feedbacks found'}
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <tr 
                    key={feedback.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${!feedback.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {feedback.firstName} {feedback.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <FaEnvelope className="mr-2" />
                        {feedback.workEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <FaBuilding className="mr-2 text-gray-400" />
                        {feedback.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <FaGlobe className="mr-2" />
                        {feedback.country}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {feedback.productServiceInterest}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(feedback.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.isRead
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {feedback.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewFeedback(feedback.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                          title="View Details"
                        >
                          <FaEye />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                          title="Delete"
                        >
                          <FaTrash />
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

      {/* View Feedback Modal */}
      {showViewModal && selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
          onClick={() => {
            setShowViewModal(false);
            setSelectedFeedback(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Feedback Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.workEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Company</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Country</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product/Service Interest</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.productServiceInterest}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">How did you hear about us?</label>
                    <p className="text-gray-900 dark:text-white">{selectedFeedback.howDidYouHearAboutUs}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Submitted At</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedFeedback.submittedAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">How can we help?</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {selectedFeedback.howCanWeHelp}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Consent Given</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedFeedback.consentGiven ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbacksPage;

