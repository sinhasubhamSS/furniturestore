// components/ui/ActionButton.tsx
"use client";
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  isLoading?: boolean;
}

// ✅ Centralized styling to avoid duplication
const getVariantClasses = (variant: ActionButtonProps['variant']) => {
  const classes = {
    primary: 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return classes[variant || 'primary'];
};

const getSizeClasses = (size: ActionButtonProps['size']) => {
  const classes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
  };
  return classes[size || 'md'];
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = "inline-flex items-center gap-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const stateClasses = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105";
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${stateClasses} ${className}`;

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={combinedClasses}
    >
      <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};

export default ActionButton;
