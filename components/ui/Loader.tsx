// components/ui/Loader.tsx
import React from 'react';

const Loader = ({ size = 'md', color = 'text-premiumGradientStart', className = '', message }: any) => {
  const sizeClasses = {
    sm: 'h-4 w-4 md:h-5 md:w-5',
    md: 'h-8 w-8 md:h-10 md:w-10',
    lg: 'h-12 w-12 md:h-16 md:w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`animate-spin rounded-full border-4 border-t-4 border-gray-700 dark:border-gray-300 ${color} ${sizeClasses[size]}`}
          style={{ borderTopColor: 'currentColor' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-premiumGradientStart rounded-full animate-pulse"></div>
        </div>
      </div>
      {message && <p className="mt-3 md:mt-4 text-sm md:text-base text-darkText dark:text-lightText font-medium">{message}</p>}
    </div>
  );
};

export default Loader;