import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { FaLinkedin, FaFacebook, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

const Footer = () => {
  const [footerSettings, setFooterSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [footerLinks, setFooterLinks] = useState([]);

  const fileBaseUrl = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5119';
    return apiUrl.endsWith('/api') ? apiUrl.replace(/\/api$/, '') : apiUrl;
  }, []);

  useEffect(() => {
    fetchFooterSettings();
    
    // Refresh footer settings every 30 seconds to catch updates
    const interval = setInterval(() => {
      fetchFooterSettings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFooterSettings = async () => {
    try {
      const response = await api.get('/FooterSettings');
      const data = response.data;
      
      // Ensure logo URL is properly formatted
      if (data.companyLogoUrl && !data.companyLogoUrl.startsWith('http')) {
        const normalizedPath = data.companyLogoUrl.startsWith('/')
          ? data.companyLogoUrl
          : `/${data.companyLogoUrl}`;
        data.companyLogoUrl = `${fileBaseUrl}${normalizedPath}`;
      }
      
      // Ensure company name is set
      if (!data.companyName) {
        data.companyName = 'IT Solution Portfolio';
      }
      
      setFooterSettings(data);
      
      // Parse footer links JSON
      if (data.footerLinksJson) {
        try {
          const links = JSON.parse(data.footerLinksJson);
          setFooterLinks(links);
        } catch (e) {
          console.error('Error parsing footer links:', e);
          setFooterLinks([]);
        }
      }
    } catch (err) {
      console.error('Error fetching footer settings:', err);
      // Use default settings on error
      setFooterSettings({
        companyName: 'IT Solution Portfolio',
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
        copyrightText: '© 2025 IT Solution Portfolio. All Rights Reserved.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !footerSettings) {
    return (
      <footer className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-8">
          {/* Company Logo and Why NETSOL Column */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Link to="/" className="flex items-center mb-4">
                {footerSettings.companyLogoUrl ? (
                  <img 
                    src={footerSettings.companyLogoUrl}
                    alt={footerSettings.companyName || 'Company Logo'}
                    className="h-12 object-contain mr-3"
                    onError={(e) => {
                      console.error('Error loading logo:', footerSettings.companyLogoUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                {footerSettings.companyName && (
                  <div className="text-3xl font-bold">
                    <span className="text-white">{footerSettings.companyName}</span>
                  </div>
                )}
                {!footerSettings.companyName && !footerSettings.companyLogoUrl && (
                  <div className="text-3xl font-bold">
                    <span className="text-white">N</span>
                    <span className="text-blue-300">ETSOL</span>
                  </div>
                )}
              </Link>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Why NETSOL</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-blue-300 transition-colors">Why NETSOL</Link></li>
                <li><Link to="/about" className="hover:text-blue-300 transition-colors">Board Of Directors</Link></li>
                <li><Link to="/about" className="hover:text-blue-300 transition-colors">Management Team</Link></li>
                <li><Link to="/contact" className="hover:text-blue-300 transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          {/* Investors Column */}
          <div>
            <h3 className="font-semibold mb-3">Investors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/investors" className="hover:text-blue-300 transition-colors">Investors</Link></li>
              <li><Link to="/investors" className="hover:text-blue-300 transition-colors">Company Information</Link></li>
              <li><Link to="/investors" className="hover:text-blue-300 transition-colors">News</Link></li>
              <li><Link to="/investors" className="hover:text-blue-300 transition-colors">Stock Data</Link></li>
              <li><Link to="/investors" className="hover:text-blue-300 transition-colors">SEC Filings</Link></li>
            </ul>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="font-semibold mb-3">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Transcend Platform</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Digital Retail</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Intermediary Portals</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Originations</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Servicing</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Wholesale Finance</Link></li>
              <li><Link to="/products" className="hover:text-blue-300 transition-colors">Mobility Solutions</Link></li>
            </ul>
          </div>

          {/* Consultancy Column */}
          <div>
            <h3 className="font-semibold mb-3">Consultancy</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Information Security</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Digital Solutions</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">AI, ML & Data Analytics</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Generative AI</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Emerging Technologies</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Cloud Services</Link></li>
              <li><Link to="/consultancy" className="hover:text-blue-300 transition-colors">Data Engineering</Link></li>
            </ul>
          </div>

          {/* Insights Column */}
          <div>
            <h3 className="font-semibold mb-3">Insights</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/insights" className="hover:text-blue-300 transition-colors">Case Studies</Link></li>
              <li><Link to="/insights" className="hover:text-blue-300 transition-colors">Industries</Link></li>
              <li><Link to="/insights" className="hover:text-blue-300 transition-colors">Guides</Link></li>
              <li><Link to="/insights" className="hover:text-blue-300 transition-colors">Blog</Link></li>
              <li><Link to="/insights" className="hover:text-blue-300 transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Marketplace Column */}
          <div>
            <h3 className="font-semibold mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">Calculation Engine</Link></li>
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">Document Generation</Link></li>
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">API Library</Link></li>
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">Loan Origination System</Link></li>
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">Customer Care Portal</Link></li>
              <li><Link to="/marketplace" className="hover:text-blue-300 transition-colors">Tax Calculation Engine</Link></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="font-semibold mb-3">Solutions</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/solutions" className="hover:text-blue-300 transition-colors">Asset Finance</Link></li>
              <li><Link to="/solutions" className="hover:text-blue-300 transition-colors">Automotive Finance</Link></li>
              <li><Link to="/solutions" className="hover:text-blue-300 transition-colors">Equipment Finance</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="mt-12 pt-8 border-t border-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
              <div className="mb-4">
                <h4 className="font-medium mb-3 text-base">Corporate Headquarters</h4>
                {footerSettings.address ? (
                  <div className="mb-2">
                    <p className="text-sm text-blue-200 leading-relaxed">{footerSettings.address}</p>
                  </div>
                ) : (
                  <p className="text-sm text-blue-200 mb-2">16000 Ventura Blvd, Suite 770 Encino, CA 91436, USA</p>
                )}
                {footerSettings.phone ? (
                  <p className="text-sm text-blue-200 mb-2">{footerSettings.phone}</p>
                ) : (
                  <p className="text-sm text-blue-200 mb-2">+1 818 222 9195</p>
                )}
                {footerSettings.email && (
                  <p className="text-sm text-blue-200 mb-2">{footerSettings.email}</p>
                )}
                {footerSettings.mapLocationUrl && (
                  <div className="mt-3">
                    <a
                      href={footerSettings.mapLocationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-300 hover:text-blue-100 underline inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
                      View on Map
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Connect With Us</h4>
              <div className="flex gap-4">
                {footerSettings.linkedInVisible && footerSettings.linkedInUrl && (
                  <a
                    href={footerSettings.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                )}
                {footerSettings.facebookVisible && footerSettings.facebookUrl && (
                  <a
                    href={footerSettings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="Facebook"
                  >
                    <FaFacebook className="w-6 h-6" />
                  </a>
                )}
                {footerSettings.twitterVisible && footerSettings.twitterUrl && (
                  <a
                    href={footerSettings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="Twitter/X"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </a>
                )}
                {footerSettings.tiktokVisible && footerSettings.tiktokUrl && (
                  <a
                    href={footerSettings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="TikTok"
                  >
                    <FaTiktok className="w-6 h-6" />
                  </a>
                )}
                {footerSettings.youtubeVisible && footerSettings.youtubeUrl && (
                  <a
                    href={footerSettings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="YouTube"
                  >
                    <FaYoutube className="w-6 h-6" />
                  </a>
                )}
                {footerSettings.whatsAppVisible && footerSettings.whatsAppUrl && (
                  <a
                    href={footerSettings.whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="WhatsApp"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-blue-200">
              {footerSettings.copyrightText || '© 2025 IT Solution Portfolio. All Rights Reserved.'}
            </p>
            <div className="flex flex-wrap gap-4 text-blue-200">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <span>|</span>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link to="/human-rights" className="hover:text-white transition-colors">Human Rights Policy</Link>
              <span>|</span>
              <Link to="/modern-slavery" className="hover:text-white transition-colors">Modern Slavery Act</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
