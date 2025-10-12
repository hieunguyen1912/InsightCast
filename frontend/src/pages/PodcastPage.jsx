/**
 * Podcast page component
 * Individual podcast episode view with player and details
 */

import React from 'react';
import { useParams } from 'react-router-dom';

function PodcastPage() {
  const { id } = useParams();

  return (
    <div className="podcast-page">
      <div className="container">
        <h1>Podcast Episode</h1>
        <p>Episode ID: {id}</p>
        <div className="podcast-content">
          <p>Podcast player and details will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}

export default PodcastPage;
