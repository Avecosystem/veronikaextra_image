// components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-16 h-9 flex items-center rounded-full p-1 cursor-pointer
                 bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-200 dark:to-gray-300
                 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-premiumGradientStart shadow-glass-dark dark:shadow-glass-light"
      aria-label="Toggle theme"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center`}
        animate={{ 
          x: isDark ? 0 : 36,
          backgroundColor: isDark ? "#ffffff" : "#1f2937"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 700, 
          damping: 30 
        }}
      >
        {isDark ? (
          <motion.svg 
            className="w-4 h-4 text-yellow-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.218A9.993 9.006 0 0110 18a9.994 9.994 0 01-5.541-1.782l-.894.894a1 1 0 11-1.414-1.414l.894-.894A8 8 0 1014.541 15.782l.894.894a1 1 0 01-1.414 1.414l-.894-.894zM7 6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm-.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 101.414 1.414l1-1a1 1 0 000-1.414zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.707-.293a1 1 0 00-1.414-1.414l-1 1a1 1 0 101.414 1.414l1-1z" clipRule="evenodd"></path>
          </motion.svg>
        ) : (
          <motion.svg 
            className="w-4 h-4 text-gray-800" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </motion.svg>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;