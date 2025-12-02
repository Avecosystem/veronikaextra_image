// components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: any) => {
  const baseStyles = 'font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-darkBg dark:focus:ring-offset-lightBg';
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-premiumGradientStart to-premiumGradientEnd text-white shadow-premium hover:shadow-premium-glow hover:from-premiumGradientEnd hover:to-premiumGradientStart',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    outline: 'border-2 border-gray-400 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    ghost: 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    download: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-premium hover:shadow-premium-glow',
    premium: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-premium hover:shadow-premium-glow hover:from-indigo-600 hover:to-purple-600'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base',
    md: 'px-4 py-2 text-base md:px-6 md:py-3 md:text-lg',
    lg: 'px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl',
    xl: 'px-8 py-4 text-xl md:px-10 md:py-5 md:text-2xl'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${(disabled || loading) ? disabledStyles : ''
        } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 md:h-6 md:w-6 text-current mr-2 md:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm md:text-base">Processing...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;