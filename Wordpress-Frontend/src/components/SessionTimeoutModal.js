import React, { useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';

export const SessionTimeoutModal = () => {
  const { showWarning, timeRemaining, extendSession, isAuthenticated } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60-second countdown

  // Show/hide modal based on warning state
  useEffect(() => {
    if (showWarning && isAuthenticated) {
      setIsOpen(true);
      setCountdown(60); // Reset countdown when warning appears
    } else {
      setIsOpen(false);
    }
  }, [showWarning, isAuthenticated]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Auto-logout when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isOpen) {
      // The actual logout will be handled by the useSession hook
      setIsOpen(false);
    }
  }, [countdown, isOpen]);

  const handleStayLoggedIn = () => {
    extendSession();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="w-6 h-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Session Timeout Warning
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your session is about to expire due to inactivity. You will be logged out in{' '}
                    <span className="font-semibold">{countdown} seconds</span>.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    To remain logged in, click "Stay Logged In" below.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleStayLoggedIn}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Stay Logged In
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
