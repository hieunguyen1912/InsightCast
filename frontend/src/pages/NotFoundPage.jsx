/**
 * 404 Not Found page component
 * Displayed when a route is not found
 */

import React from 'react';
import { Home } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          <Home className="h-5 w-5" />
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default NotFoundPage;
