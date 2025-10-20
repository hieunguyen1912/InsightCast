/**
 * Footer component - Sports News Website Design
 * Black footer with newsletter subscription and category links
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">LET'S READ</h3>
            <p className="text-gray-300 mb-6">Latest Headlines: Breaking News and Updates</p>
            
            {/* Newsletter Subscription */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Subscribe to our Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="test@gmail.com"
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l-md border-0 focus:ring-2 focus:ring-orange-500"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-r-md font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">HOME</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">News</a></li>
              <li><a href="#" className="hover:text-white transition-colors">U.S.</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">World</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Business</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">ENTERTAINMENT</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Arts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">TV/Radio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Magazine</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">TIME ZONE</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Video</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Podcast</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Multimedia</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Subscribe</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital Magazine</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
