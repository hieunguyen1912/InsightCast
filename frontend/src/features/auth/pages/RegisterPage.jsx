/**
 * Register page component - Clean registration form with Tailwind CSS
 * Floating background elements for visual interest
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { isValidEmail, validatePassword, validateUsername } from '../../../utils/validation';
import '../../../assets/styles/AuthPage.css'; // Only for floating shapes animation

function RegisterPage() {
  const { register, error, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.message;
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      errors.email = 'Email must not exceed 100 characters';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    
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
            <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join thousands of creators who trust AI to enhance their content
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
              <label htmlFor="username" className="text-sm font-medium text-black">
                Username
              </label>
              <div className={`relative flex items-center px-4 py-3 border rounded-md bg-white transition-all ${validationErrors.username ? 'border-red-500' : 'border-gray-200 focus-within:border-black'}`}>
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="flex-1 border-0 outline-none bg-transparent text-base text-black placeholder-gray-400"
                  placeholder="Enter username (3-50 characters)"
                  required
                  maxLength={50}
                  aria-describedby={validationErrors.username ? 'username-error' : undefined}
                />
              </div>
              {validationErrors.username && (
                <span id="username-error" className="text-sm text-red-600">
                  {validationErrors.username}
                </span>
              )}
              <p className="text-xs text-gray-500">
                Letters, numbers, and underscores only (3-50 characters)
              </p>
            </div>

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
                  placeholder="Create a password"
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

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                Confirm Password
              </label>
              <div className={`relative flex items-center px-4 py-3 border rounded-md bg-white transition-all ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus-within:border-black'}`}>
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="flex-1 border-0 outline-none bg-transparent text-base text-black placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                  aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
                />
              </div>
              {validationErrors.confirmPassword && (
                <span id="confirm-password-error" className="text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              <label className="flex items-start gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                <input type="checkbox" name="terms" required className="hidden" />
                <div className="w-4 h-4 border-2 border-gray-300 rounded-sm bg-white transition-all mt-0.5 [input:checked+&]:bg-black [input:checked+&]:border-black relative flex-shrink-0">
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 transition-opacity [input:checked~*_&]:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-black font-medium hover:text-gray-600 transition-colors">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-black font-medium hover:text-gray-600 transition-colors">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md font-medium transition-all hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-medium hover:text-gray-600 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
