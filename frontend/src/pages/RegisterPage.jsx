/**
 * Register page component
 * User registration form with validation
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, validatePassword } from '../utils/validation';
import './RegisterPage.css';

function RegisterPage() {
  const { register, error, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      // Redirect will be handled by the auth context
      window.location.href = '/';
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join PodcastAI and start your podcast journey</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                required
                aria-describedby={validationErrors.name ? 'name-error' : undefined}
              />
              {validationErrors.name && (
                <span id="name-error" className="error-text">
                  {validationErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                required
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email && (
                <span id="email-error" className="error-text">
                  {validationErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                placeholder="Create a password"
                required
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
              />
              {validationErrors.password && (
                <span id="password-error" className="error-text">
                  {validationErrors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                required
                aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {validationErrors.confirmPassword && (
                <span id="confirm-password-error" className="error-text">
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="terms" required />
                <span className="checkbox-text">
                  I agree to the{' '}
                  <a href="/terms" className="link">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="link">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" className="link">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
