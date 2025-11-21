import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, verifying, success, invalid_token, token_expired, error, resent
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL params (React Router auto-decodes)
      // But also check the actual URL in case of issues
      const urlToken = token;
      const actualUrl = window.location.href;
      const urlPath = window.location.pathname;
      
      console.log('=== Email Verification Debug ===');
      console.log('Token from useParams:', urlToken);
      console.log('Full URL:', actualUrl);
      console.log('URL Path:', urlPath);
      
      if (!urlToken) {
        // Try to extract from URL manually
        const pathMatch = urlPath.match(/\/verify-email\/(.+)/);
        if (pathMatch && pathMatch[1]) {
          console.log('Extracted token from path manually:', pathMatch[1].substring(0, 50));
        }
        
        setError('Invalid verification link. No token provided.');
        setErrorType('invalid_token');
        setStatus('invalid_token');
        return;
      }

      // Set verifying status
      setStatus('verifying');

      try {
        // React Router's useSearchParams() auto-decodes the token
        // But ASP.NET Identity tokens contain special characters like +, /, = that need proper handling
        // We should send the token as-is (decoded) since that's what Identity expects
        let tokenToSend = token;
        
        // Log the token for debugging
        console.log('=== Email Verification Debug ===');
        console.log('Token from URL (first 100 chars):', token?.substring(0, 100));
        console.log('Token length:', token?.length || 0);
        console.log('Token contains +:', token?.includes('+') || false);
        console.log('Token contains /:', token?.includes('/') || false);
        console.log('Token contains =:', token?.includes('=') || false);
        console.log('Full URL:', window.location.href);
        
        // Send the decoded token as-is - ASP.NET Identity expects the raw token
        // The backend will handle any additional decoding if needed
        
        console.log('Sending token to backend (length:', tokenToSend?.length || 0, ')');
        console.log('Token sample (last 50 chars):', tokenToSend?.substring(tokenToSend.length - 50) || '');
        
        // Ensure we're sending the token correctly - don't let axios modify it
        const response = await axios.post('http://localhost:5119/api/auth/verify-email', 
          { token: tokenToSend },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Verification response:', response.data);
        console.log('Response success flag:', response.data.success);
        console.log('Response message:', response.data.message);
        
        // Check if verification was successful
        // Backend returns { success: true, message: "...", email: "..." } on success
        if (response.data && (response.data.success === true || response.status === 200)) {
          setStatus('success');
          setUserEmail(response.data.email || '');
          console.log('✓ Verification successful, setting status to success');
        } else {
          // Handle unexpected response format
          console.warn('Unexpected response format:', response.data);
          setStatus('error');
          setError(response.data.message || 'Verification failed');
        }
      } catch (err) {
        console.error('=== Email Verification Error ===');
        console.error('Error object:', err);
        console.error('Error response:', err.response);
        console.error('Error response data:', JSON.stringify(err.response?.data, null, 2));
        console.error('Error status:', err.response?.status);
        console.error('Error message:', err.message);
        console.error('Request payload:', { token: token?.substring(0, 50) + '...' });
        
        const errorData = err.response?.data || {};
        const errorMessage = errorData.message || err.message || 'Email verification failed. The link may have expired.';
        const errorType = errorData.errorType || 'error';
        
        console.error('Error details:', errorData.details || 'No additional details');
        
        setError(errorMessage);
        setErrorType(errorType);
        setUserEmail(errorData.email || '');
        
        // Set specific status based on error type
        if (errorType === 'token_expired') {
          setStatus('token_expired');
        } else if (errorType === 'invalid_token') {
          setStatus('invalid_token');
        } else {
          setStatus('error');
        }
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('invalid_token');
      setError('Invalid verification link. No token provided.');
      setErrorType('invalid_token');
    }
  }, [token]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const email = userEmail || prompt('Please enter your email address:');
      if (!email) {
        setError('Email address is required');
        setIsResending(false);
        return;
      }
      
      const response = await axios.post('http://localhost:5119/api/auth/resend-verification', { email });
      
      if (response.data.message) {
        setStatus('resent');
        setUserEmail(email);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
      setErrorType('resend_failed');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        message: status === 'success' 
          ? 'Email verified successfully! Please log in.' 
          : 'Please check your email for the verification link.' 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Preparing Verification...
            </h2>
          </div>
        )}

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifying Your Email
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                  <p className="mt-6 text-base text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    This may take a few seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Verified Successfully!
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Verification Complete!
                  </h3>
                  <p className="text-base text-gray-600 mb-6">
                    Your email address has been successfully verified. You can now log in to your account.
                  </p>
                  {userEmail && (
                    <p className="text-sm text-gray-500 mb-6">
                      Verified: <span className="font-medium">{userEmail}</span>
                    </p>
                  )}
                  <button
                    onClick={handleGoToLogin}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Invalid Token State */}
        {status === 'invalid_token' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Verification Link
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-base text-gray-600 mb-6">
                    {error || 'The verification link is invalid or has already been used. Please request a new verification email.'}
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </button>
                    
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Token Expired State */}
        {status === 'token_expired' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Link Expired
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                    <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Link Has Expired
                  </h3>
                  <p className="text-base text-gray-600 mb-2">
                    {error || 'This verification link has expired. Verification links are valid for 24 hours.'}
                  </p>
                  {userEmail && (
                    <p className="text-sm text-gray-500 mb-6">
                      Email: <span className="font-medium">{userEmail}</span>
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Request New Verification Email'
                      )}
                    </button>
                    
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* General Error State */}
        {status === 'error' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Error
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Something Went Wrong
                  </h3>
                  <p className="text-base text-gray-600 mb-6">
                    {error || 'An error occurred during verification. Please try again.'}
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </button>
                    
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resent Success State */}
        {status === 'resent' && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Email Sent
            </h2>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-base text-gray-600 mb-2">
                    A new verification email has been sent to your email address.
                  </p>
                  {userEmail && (
                    <p className="text-sm text-gray-500 mb-6">
                      Sent to: <span className="font-medium">{userEmail}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mb-6">
                    Please check your inbox and click the verification link. The link will expire in 24 hours.
                  </p>
                  
                  <button
                    onClick={handleGoToLogin}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
