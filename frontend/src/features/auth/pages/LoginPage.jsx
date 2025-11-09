/**
 * Login page component - Clean authentication form with Tailwind CSS
 * Floating background elements for visual interest
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { isValidEmail } from '../../../utils/validation';
import '../../../assets/styles/AuthPage.css'; // Only for floating shapes animation

function LoginPage() {
  const { login, error, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    setIsLoaded(true);
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await login(formData);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-8 sm:p-12 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-2xl font-bold inline-flex items-baseline gap-0.5">
                <span className="text-black">Podcast</span>
                <span className="text-black font-extrabold">AI</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sign in to continue your podcast journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium" role="alert">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email Address
              </label>
              <div className={`relative flex items-center px-4 py-3 border rounded-md bg-white transition-all ${validationErrors.email ? 'border-red-500' : 'border-gray-200 focus-within:border-black'}`}>
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 border-0 outline-none bg-transparent text-base text-black placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
              </div>
              {validationErrors.email && (
                <span id="email-error" className="text-sm text-red-600">
                  {validationErrors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">
                Password
              </label>
              <div className={`relative flex items-center px-4 py-3 border rounded-md bg-white transition-all ${validationErrors.password ? 'border-red-500' : 'border-gray-200 focus-within:border-black'}`}>
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 border-0 outline-none bg-transparent text-base text-black placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                />
              </div>
              {validationErrors.password && (
                <span id="password-error" className="text-sm text-red-600">
                  {validationErrors.password}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                <input type="checkbox" name="remember" className="hidden" />
                <div className="w-4 h-4 border-2 border-gray-300 rounded-sm bg-white transition-all [input:checked+&]:bg-black [input:checked+&]:border-black relative">
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 transition-opacity [input:checked~*_&]:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-black hover:text-gray-600 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md font-medium transition-all hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-black font-medium hover:text-gray-600 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
