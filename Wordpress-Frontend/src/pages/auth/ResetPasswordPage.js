import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { parseBackendErrors, getErrorMessage } from '../../utils/errorHandler';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [userEmail, setUserEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.');
    }
  }, [token]);

  const validatePassword = (value) => {
    // Password strength calculation
    let score = 0;
    let label = '';
    
    // Length check
    if (value.length >= 8) score += 1;
    // Contains number
    if (/\d/.test(value)) score += 1;
    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;
    // Contains upper and lower case
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(value)) score += 1;
    
    // Set strength label
    if (value.length === 0) {
      label = '';
    } else if (value.length < 6) {
      label = 'Too short';
    } else {
      const labels = ['Weak', 'Fair', 'Good', 'Strong'];
      label = labels[Math.min(score - 1, 3)] || '';
    }
    
    setPasswordStrength({ score, label });
    return score >= 3; // At least 'Good' strength
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      return;
    }

    if (!token) {
      setError('Invalid reset link. No token provided.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Log the token for debugging
      console.log('=== Password Reset Debug ===');
      console.log('Token from URL (first 100 chars):', token?.substring(0, 100));
      console.log('Token length:', token?.length || 0);
      console.log('Token contains +:', token?.includes('+') || false);
      console.log('Token contains /:', token?.includes('/') || false);
      console.log('Token contains =:', token?.includes('=') || false);
      console.log('Full URL:', window.location.href);
      console.log('Email:', userEmail);
      
      // Send data in correct format (PascalCase for C#)
      // Send the token as-is - ASP.NET Identity expects the raw token
      // The backend will handle any additional decoding if needed
      console.log('Sending token to backend (length:', token?.length || 0, ')');
      
      const response = await axios.post('http://localhost:5119/api/auth/reset-password', {
        Email: userEmail || '',
        Token: token,
        NewPassword: password
      });
      
      setMessage(response.data?.message || 'Your password has been reset successfully!');
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please log in with your new password.' } 
        });
      }, 3000);
    } catch (err) {
      console.error('=== Password Reset Error ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      console.error('Request payload:', { Email: userEmail, Token: token?.substring(0, 50) + '...', NewPassword: '***' });
      
      // Parse backend validation errors
      const { fieldErrors: errors, generalMessage, generalErrors } = parseBackendErrors(err.response);
      setFieldErrors(errors);
      
      // Set error message (prefer field-specific errors, then general message)
      if (errors.email) {
        setError(errors.email);
      } else if (errors.password) {
        setError(errors.password);
      } else if (errors.token) {
        setError(errors.token);
      } else {
        setError(generalMessage || getErrorMessage(err) || 'Failed to reset password. The link may have expired.');
      }
      
      console.error('Parsed field errors:', errors);
      console.error('General message:', generalMessage);
      console.error('General errors:', generalErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    switch (passwordStrength.score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>
      <div>
        {message ? (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {message}
                </p>
              </div>
            </div>
          </div>
        ) : !token ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Invalid reset link. Please request a new password reset.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.email) {
                        setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your email address"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      fieldErrors.password || fieldErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                </div>
                {password && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength.label} {passwordStrength.score > 0 && `• ${passwordStrength.score}/4`}
                    </p>
                  </div>
                )}
                {(fieldErrors.password || fieldErrors.newPassword) && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.password || fieldErrors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Remember your password?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
