/**
 * Alert Component
 * Displays alert messages with different variants
 */

import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

/**
 * Alert component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.variant - Alert variant: 'info' | 'success' | 'warning' | 'error'
 * @param {string} props.title - Alert title
 * @param {boolean} props.dismissible - Can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 * @param {boolean} props.icon - Show icon
 * @param {string} props.className - Additional CSS classes
 */
function Alert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon = true,
  className = ''
}) {
  // Variant styles
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      IconComponent: Info
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-500',
      IconComponent: CheckCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      IconComponent: AlertTriangle
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      IconComponent: XCircle
    }
  };

  const style = variantStyles[variant];
  const IconComponent = style.IconComponent;

  return (
    <div className={`border rounded-lg p-4 ${style.container} ${className}`} role="alert">
      <div className="flex items-start">
        {icon && (
          <div className={`flex-shrink-0 ${style.icon}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        )}
        
        <div className={`flex-1 ${icon ? 'ml-3' : ''}`}>
          {title && (
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-current opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;

