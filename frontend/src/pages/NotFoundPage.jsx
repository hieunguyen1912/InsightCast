/**
 * 404 Not Found page component
 * Displayed when a route is not found
 */

import React from 'react';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    </div>
  );
}

export default NotFoundPage;
