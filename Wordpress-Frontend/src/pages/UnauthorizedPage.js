// src/pages/UnauthorizedPage.js
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Unauthorized</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        <div className="mt-6 space-x-4">
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link 
            to="/login" 
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;