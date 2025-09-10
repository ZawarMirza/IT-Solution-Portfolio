// src/pages/UnauthorizedPage.js
import { Link, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from "../context";

function UnauthorizedPage() {
  const location = useLocation();
  const { user, isAdmin, isUser } = useAuth();
  const { message = "You don't have permission to access this page.", requiredRoles = [] } = location.state || {};

  // Get the current user's highest role for display
  const getUserRole = () => {
    if (!user) return 'Guest';
    if (isAdmin()) return 'Administrator';
    if (isUser()) return 'Registered User';
    return 'Guest';
  };

  // Format required roles for display
  const formatRequiredRoles = () => {
    if (!requiredRoles || requiredRoles.length === 0) return 'any role';
    return requiredRoles.map(role => {
      switch(role) {
        case ROLES.ADMIN: return 'Administrator';
        case ROLES.USER: return 'Registered User';
        default: return role;
      }
    }).join(' or ');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Your current role: <span className="font-bold">{getUserRole()}</span>
            </p>
            {requiredRoles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                This page requires {formatRequiredRoles()}
              </p>
            )}
            
            <div className="mt-6">
              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please sign in with an account that has the required permissions.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: location.state?.from || '/' }}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign in
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please contact an administrator if you believe this is an error.
                  </p>
                  <Link
                    to="/"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
