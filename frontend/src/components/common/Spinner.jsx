/**
 * Loading Spinner Component
 * Consistent loading indicator across the application
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component for loading states
 * @param {Object} props
 * @param {string} props.size - Spinner size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.color - Spinner color: 'primary' | 'white' | 'gray'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Show as full-screen overlay
 * @param {string} props.className - Additional CSS classes
 */
function Spinner({
  size = 'md',
  color = 'primary',
  text = '',
  fullScreen = false,
  className = ''
}) {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color styles
  const colorStyles = {
    primary: 'text-orange-500',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  const spinnerClasses = `${sizeStyles[size]} ${colorStyles[color]} animate-spin ${className}`;

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className={`${sizeStyles.lg} ${colorStyles.primary} animate-spin mx-auto`} />
          {text && <p className="mt-4 text-gray-600 text-lg">{text}</p>}
        </div>
      </div>
    );
  }

  // Inline spinner
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={spinnerClasses} />
      {text && <span className="ml-3 text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * Inline loading spinner for buttons and small areas
 */
export function SpinnerInline({ size = 'sm', className = '' }) {
  return (
    <Loader2 className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${className}`} />
  );
}

export default Spinner;

