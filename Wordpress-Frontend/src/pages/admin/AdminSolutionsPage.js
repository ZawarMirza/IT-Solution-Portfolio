import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaPlus, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';

const emptySolution = {
  title: '',
  subtitle: '',
  description: '',
  domainId: '',
  icon: '',
  imageUrl: '',
  actionText: '',
  actionUrl: '',
  isFeatured: false,
  tags: '',
  features: ''
};

const AdminSolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptySolution);
  const [editingSolutionId, setEditingSolutionId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [solutionsResponse, domainsResponse] = await Promise.all([
        api.get('/Solutions'),
        api.get('/domains')
      ]);
      setSolutions(solutionsResponse.data || []);
      setDomains(domainsResponse.data || []);
    } catch (err) {
      console.error('Error fetching solutions:', err);
      toast.error('Failed to load solutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateForm = () => {
    setFormData(emptySolution);
    setEditingSolutionId(null);
    setShowForm(true);
  };

  const openEditForm = (solution) => {
    setEditingSolutionId(solution.id);
    setFormData({
      title: solution.title || '',
      subtitle: solution.subtitle || '',
      description: solution.description || '',
      domainId: solution.domain?.id || solution.domainId || '',
      icon: solution.icon || '',
      imageUrl: solution.imageUrl || '',
      actionText: solution.actionText || '',
      actionUrl: solution.actionUrl || '',
      isFeatured: solution.isFeatured || false,
      tags: (solution.tags || []).join(', '),
      features: (solution.features || []).join('\n')
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(emptySolution);
    setEditingSolutionId(null);
  };

  const transformPayload = () => {
    const tags = formData.tags
      ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

    const features = formData.features
      ? formData.features.split('\n').map((feature) => feature.trim()).filter(Boolean)
      : [];

    return {
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || null,
      description: formData.description?.trim() || null,
      domainId: Number(formData.domainId),
      icon: formData.icon?.trim() || null,
      imageUrl: formData.imageUrl?.trim() || null,
      actionText: formData.actionText?.trim() || null,
      actionUrl: formData.actionUrl?.trim() || null,
      isFeatured: Boolean(formData.isFeatured),
      tags,
      features
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.domainId) {
      toast.error('Please provide a title and select a domain.');
      return;
    }

    try {
      setSaving(true);
      const payload = transformPayload();
      if (editingSolutionId) {
        await api.put(`/Solutions/${editingSolutionId}`, payload);
        toast.success('Solution updated successfully');
      } else {
        await api.post('/Solutions', payload);
        toast.success('Solution created successfully');
      }
      closeForm();
      fetchInitialData();
    } catch (err) {
      console.error('Error saving solution:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save solution.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (solutionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this solution?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/Solutions/${solutionId}`);
      toast.success('Solution deleted successfully');
      fetchInitialData();
    } catch (err) {
      console.error('Error deleting solution:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete solution.';
      toast.error(errorMessage);
    }
  };

  const solutionsCount = useMemo(() => solutions.length, [solutions]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solutions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage the solutions shown on the public page</p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaPlus /> Add Solution
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading solutions...</div>
      ) : solutionsCount === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No solutions found. Click "Add Solution" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {solutions.map((solution) => (
                <tr key={solution.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="font-semibold">{solution.title}</div>
                    {solution.subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{solution.subtitle}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {solution.domain?.name || solution.domainName || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {solution.isFeatured ? (
                      <span className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">Yes</span>
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {solution.updatedAt
                      ? new Date(solution.updatedAt).toLocaleDateString()
                      : new Date(solution.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                    <button
                      onClick={() => openEditForm(solution)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 inline-flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(solution.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 inline-flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-10 mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {editingSolutionId ? 'Edit Solution' : 'Add Solution'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingSolutionId ? 'Update solution details' : 'Create a new solution entry'}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain *</label>
                  <select
                    name="domainId"
                    value={formData.domainId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (optional)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="e.g., fa-solid fa-cloud"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.png or /uploads/img.png"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Text</label>
                  <input
                    type="text"
                    name="actionText"
                    value={formData.actionText}
                    onChange={handleInputChange}
                    placeholder="Learn More"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA URL</label>
                  <input
                    type="text"
                    name="actionUrl"
                    value={formData.actionUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/solution"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-gray-700 dark:text-gray-300">
                    Feature this solution
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Describe the solution, value proposition, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                  <textarea
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Cloud, AI, Enterprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highlights / Features (one per line)</label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Bullet 1&#10;Bullet 2&#10;Bullet 3"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : editingSolutionId ? 'Update Solution' : 'Create Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolutionsPage;

