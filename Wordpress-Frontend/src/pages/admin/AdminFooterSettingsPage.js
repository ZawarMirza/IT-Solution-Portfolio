import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaLinkedin, FaFacebook, FaTwitter, FaYoutube, FaWhatsapp, FaEye, FaEyeSlash, FaUpload, FaMapMarkerAlt } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

const AdminFooterSettingsPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [mapLocation, setMapLocation] = useState({ lat: null, lng: null, address: '' });
  const fileInputRef = useRef(null);
  const fileBaseUrl = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119';
    return apiUrl.endsWith('/api') ? apiUrl.replace(/\/api$/, '') : apiUrl;
  }, []);

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogoUrl: '',
    address: '',
    phone: '',
    email: '',
    mapLocationUrl: '',
    linkedInUrl: '',
    linkedInVisible: true,
    facebookUrl: '',
    facebookVisible: true,
    twitterUrl: '',
    twitterVisible: true,
    tiktokUrl: '',
    tiktokVisible: true,
    youtubeUrl: 'https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut',
    youtubeVisible: true,
    whatsAppUrl: '',
    whatsAppVisible: true,
    footerLinksJson: '[]',
    copyrightText: '© 2025 IT Solution Portfolio. All Rights Reserved.'
  });

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchFooterSettings();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchFooterSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/FooterSettings');
      if (response.data) {
        setFormData({
          companyName: response.data.companyName || '',
          companyLogoUrl: response.data.companyLogoUrl || '',
          address: response.data.address || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          mapLocationUrl: response.data.mapLocationUrl || '',
          linkedInUrl: response.data.linkedInUrl || '',
          linkedInVisible: response.data.linkedInVisible !== false,
          facebookUrl: response.data.facebookUrl || '',
          facebookVisible: response.data.facebookVisible !== false,
          twitterUrl: response.data.twitterUrl || '',
          twitterVisible: response.data.twitterVisible !== false,
          tiktokUrl: response.data.tiktokUrl || '',
          tiktokVisible: response.data.tiktokVisible !== false,
          youtubeUrl: response.data.youtubeUrl || 'https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut',
          youtubeVisible: response.data.youtubeVisible !== false,
          whatsAppUrl: response.data.whatsAppUrl || '',
          whatsAppVisible: response.data.whatsAppVisible !== false,
          footerLinksJson: response.data.footerLinksJson || '[]',
          copyrightText: response.data.copyrightText || '© 2025 IT Solution Portfolio. All Rights Reserved.'
        });
        
        // Set logo preview if exists
        if (response.data.companyLogoUrl) {
          const logoUrl = response.data.companyLogoUrl;
          const fullLogoUrl = logoUrl.startsWith('http')
            ? logoUrl
            : `${fileBaseUrl}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`;
          setLogoPreview(fullLogoUrl);
        }
        
        // Parse map location URL if exists
        if (response.data.mapLocationUrl) {
          try {
            const mapUrl = response.data.mapLocationUrl;
            // Try to extract coordinates from Google Maps URL
            if (mapUrl.includes('?q=')) {
              const url = new URL(mapUrl);
              const params = new URLSearchParams(url.search);
              const coords = params.get('q');
              if (coords) {
                const [lat, lng] = coords.split(',');
                if (lat && lng) {
                  setMapLocation({ 
                    lat: parseFloat(lat.trim()), 
                    lng: parseFloat(lng.trim()), 
                    address: response.data.address || '' 
                  });
                }
              }
            } else if (mapUrl.includes('@')) {
              // Handle Google Maps format like https://www.google.com/maps/@34.0522,-118.2437
              const match = mapUrl.match(/@([\d.-]+),([\d.-]+)/);
              if (match) {
                setMapLocation({ 
                  lat: parseFloat(match[1]), 
                  lng: parseFloat(match[2]), 
                  address: response.data.address || '' 
                });
              }
            }
          } catch (e) {
            console.error('Error parsing map location:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching footer settings:', err);
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/FooterSettings', formData);
      toast.success('Footer settings updated successfully!');
      // Refresh the settings to ensure everything is synced
      await fetchFooterSettings();
    } catch (err) {
      console.error('Error updating footer settings:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update footer settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const toggleSocialVisibility = (social) => {
    setFormData(prev => ({
      ...prev,
      [`${social}Visible`]: !prev[`${social}Visible`]
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (PNG, JPG, GIF, SVG, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/FooterSettings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const logoUrl = response.data.logoUrl;
      // Ensure logo URL is properly formatted for preview
      const fullLogoUrl = logoUrl.startsWith('http')
        ? logoUrl
        : `${fileBaseUrl}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`;
      setFormData(prev => ({ ...prev, companyLogoUrl: logoUrl }));
      setLogoPreview(fullLogoUrl);
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      const errorMessage = err.response?.data?.message || 'Failed to upload logo';
      toast.error(errorMessage);
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMapLocationSelect = (lat, lng, address) => {
    setMapLocation({ lat, lng, address });
    // Generate Google Maps URL
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    setFormData(prev => ({ 
      ...prev, 
      mapLocationUrl: mapUrl, 
      address: address || prev.address 
    }));
    toast.success('Location selected successfully!');
  };

  const openMapPicker = () => {
    // Open Google Maps in a new window for location selection
    const url = 'https://www.google.com/maps';
    window.open(url, '_blank', 'width=800,height=600');
    
    // For a better UX, we'll use a simple input for coordinates or address
    // In a production app, you'd integrate Google Maps API
    const address = prompt('Enter the address or coordinates (lat,lng):');
    if (address) {
      // Try to parse as coordinates
      const coords = address.split(',');
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        handleMapLocationSelect(lat, lng, address);
      } else {
        // Treat as address and generate map URL
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        setFormData(prev => ({ ...prev, mapLocationUrl: mapUrl, address: address }));
        setMapLocation({ lat: null, lng: null, address: address });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading footer settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Footer Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage footer content, links, and social media icons</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Company Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="IT Solution Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Logo
              </label>
              <div className="space-y-3">
                {logoPreview && (
                  <div className="mb-2">
                    <img 
                      src={logoPreview}
                      alt="Logo preview" 
                      className="max-w-xs h-20 object-contain border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 p-2"
                      onError={(e) => {
                        console.error('Error loading logo preview:', logoPreview);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                  >
                    <FaUpload />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </label>
                  {formData.companyLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, companyLogoUrl: '' }));
                        setLogoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: PNG, JPG, JPEG, GIF, SVG, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="16000 Ventura Blvd, Suite 770 Encino, CA 91436, USA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="+1 818 222 9195"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Map Location
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openMapPicker}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaMapMarkerAlt />
                  Pick Location
                </button>
                {mapLocation.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {mapLocation.address}
                  </p>
                )}
                {mapLocation.lat && mapLocation.lng && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Coordinates: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                  </p>
                )}
                <input
                  type="text"
                  name="mapLocationUrl"
                  value={formData.mapLocationUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Or enter Google Maps URL manually"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h2>
          <div className="space-y-4">
            {/* LinkedIn */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaLinkedin className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedInUrl"
                  value={formData.linkedInUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('linkedIn')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.linkedInVisible ? 'Hide' : 'Show'}
              >
                {formData.linkedInVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaFacebook className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('facebook')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.facebookVisible ? 'Hide' : 'Show'}
              >
                {formData.facebookVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* Twitter/X */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaTwitter className="w-6 h-6 text-blue-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter/X URL
                </label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('twitter')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.twitterVisible ? 'Hide' : 'Show'}
              >
                {formData.twitterVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaTiktok className="w-6 h-6 text-black dark:text-white" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TikTok URL
                </label>
                <input
                  type="url"
                  name="tiktokUrl"
                  value={formData.tiktokUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('tiktok')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.tiktokVisible ? 'Hide' : 'Show'}
              >
                {formData.tiktokVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* YouTube */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaYoutube className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://youtube.com/@it-solution-portfolio?si=sLwI2vTGzgO54Fut"
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('youtube')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.youtubeVisible ? 'Hide' : 'Show'}
              >
                {formData.youtubeVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <FaWhatsapp className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp URL
                </label>
                <input
                  type="url"
                  name="whatsAppUrl"
                  value={formData.whatsAppUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://wa.me/..."
                />
              </div>
              <button
                type="button"
                onClick={() => toggleSocialVisibility('whatsApp')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title={formData.whatsAppVisible ? 'Hide' : 'Show'}
              >
                {formData.whatsAppVisible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Text */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Copyright</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              name="copyrightText"
              value={formData.copyrightText}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="© 2025 IT Solution Portfolio. All Rights Reserved."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFooterSettingsPage;

