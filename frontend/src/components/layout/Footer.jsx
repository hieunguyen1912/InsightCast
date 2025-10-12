/**
 * Footer component
 * Site footer with links, copyright, and additional information
 */

import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3>PodcastAI</h3>
            <p>AI-powered podcast platform for creators and listeners.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter" className="social-link">
                <span>🐦</span>
              </a>
              <a href="#" aria-label="Facebook" className="social-link">
                <span>📘</span>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <span>💼</span>
              </a>
              <a href="#" aria-label="GitHub" className="social-link">
                <span>🐙</span>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="/discover">Discover</a></li>
                <li><a href="/categories">Categories</a></li>
                <li><a href="/trending">Trending</a></li>
                <li><a href="/recommended">Recommended</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li><a href="/ai-features">AI Features</a></li>
                <li><a href="/transcription">Transcription</a></li>
                <li><a href="/content-generation">Content Generation</a></li>
                <li><a href="/analytics">Analytics</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/community">Community</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
                <li><a href="/accessibility">Accessibility</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} PodcastAI. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="/status">Status</a>
              <a href="/security">Security</a>
              <a href="/changelog">Changelog</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
