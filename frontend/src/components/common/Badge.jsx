/**
 * Badge Component
 * Displays status, labels, or tags with consistent styling
 */

import React from 'react';

/**
 * Badge component for status indicators and labels
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'draft' | 'approved' | 'rejected' | 'submitted'
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.dot - Show dot indicator
 * @param {string} props.className - Additional CSS classes
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  // Variant styles
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    // Article status variants
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    submitted: 'bg-blue-100 text-blue-800'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // Dot indicator colors
  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    draft: 'bg-gray-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    submitted: 'bg-blue-500'
  };

  const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={badgeClasses}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

/**
 * Status Badge for article statuses
 */
export function StatusBadge({ status, ...props }) {
  const statusConfig = {
    DRAFT: { variant: 'draft', label: 'Draft' },
    SUBMITTED: { variant: 'submitted', label: 'Submitted' },
    APPROVED: { variant: 'approved', label: 'Approved' },
    REJECTED: { variant: 'rejected', label: 'Rejected' },
    PUBLISHED: { variant: 'success', label: 'Published' }
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} dot {...props}>
      {config.label}
    </Badge>
  );
}

export default Badge;

