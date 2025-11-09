/**
 * Footer component - Sports News Website Design
 * Black footer with newsletter subscription and category links
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import categoryService from '../../features/category/api';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await categoryService.getRootCategories();
        if (result.success) {
          const categoryData = result.data?.data || result.data || [];
          setCategories(Array.isArray(categoryData) ? categoryData.filter(cat => cat.isActive !== false) : []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-black text-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          
          {/* Categories Links */}
          {categories.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">CATEGORIES</h4>
              <ul className="space-y-2 text-gray-300">
                {categories.slice(0, 8).map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/category/${category.id}`}
                      className="hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">QUICK LINKS</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Subscribe</Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} LET'S READ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
