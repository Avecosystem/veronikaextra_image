// components/ui/ShimmerCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

const ShimmerCard = ({ className }: any) => {
  return (
    <motion.div 
      className={`relative overflow-hidden p-4 md:p-6 rounded-2xl md:rounded-3xl
                    bg-gradient-to-br from-gray-800/20 to-gray-700/10 dark:from-gray-100/15 dark:to-gray-200/10
                    backdrop-filter backdrop-blur-xl border border-gray-700/30 dark:border-gray-300/20
                    shadow-glass dark:shadow-glass-light
                    animate-fade-in
                    ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                      animate-shimmer"></div>
      <div className="space-y-4 md:space-y-5">
        <div className="h-4 md:h-5 bg-gray-600/50 dark:bg-gray-400/50 rounded-full w-3/4 animate-pulse"></div>
        <div className="h-4 md:h-5 bg-gray-600/50 dark:bg-gray-400/50 rounded-full w-full animate-pulse"></div>
        <div className="h-4 md:h-5 bg-gray-600/50 dark:bg-gray-400/50 rounded-full w-1/2 animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default ShimmerCard;