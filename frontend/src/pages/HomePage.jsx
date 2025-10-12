/**
 * Home page component
 * Landing page with featured content, categories, and quick access
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to PodcastAI</h1>
          <p className="hero-subtitle">
            Discover, create, and enjoy AI-powered podcast experiences
          </p>
          {isAuthenticated ? (
            <div className="hero-actions">
              <p>Welcome back, {user?.name || 'User'}!</p>
              <a href="/discover" className="btn btn-primary">
                Discover Podcasts
              </a>
            </div>
          ) : (
            <div className="hero-actions">
              <a href="/register" className="btn btn-primary">
                Get Started
              </a>
              <a href="/login" className="btn btn-outline">
                Sign In
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>AI-Powered Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎙️</div>
              <h3>Smart Transcription</h3>
              <p>Automatically transcribe your podcasts with AI-powered accuracy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Content Generation</h3>
              <p>Generate podcast content, summaries, and show notes using AI</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics & Insights</h3>
              <p>Get detailed analytics and insights about your podcast performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Recommendations</h3>
              <p>Discover new podcasts tailored to your interests and preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {[
              'Technology', 'Business', 'Education', 'Entertainment',
              'News', 'Sports', 'Health', 'Science'
            ].map((category) => (
              <a
                key={category}
                href={`/category/${category.toLowerCase()}`}
                className="category-card"
              >
                <span className="category-name">{category}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="trending-section">
        <div className="container">
          <h2>Trending Now</h2>
          <div className="trending-content">
            <p>Discover what's popular in the podcast world</p>
            <a href="/trending" className="btn btn-outline">
              View All Trending
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
