// components/ui/GlassCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '',
  whileHover = { y: -5, scale: 1.02 },
  whileTap = { scale: 0.98 },
  ...props 
}: any) => {
  return (
    <motion.div
      whileHover={whileHover}
      whileTap={whileTap}
      className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl
                 bg-gradient-to-br from-gray-800/20 to-gray-700/10 dark:from-gray-100/15 dark:to-gray-200/10
                 backdrop-filter backdrop-blur-xl border border-gray-700/30 dark:border-gray-300/20
                 shadow-glass dark:shadow-glass-light
                 transition-all duration-500 hover:shadow-premium-glow
                 before:absolute before:inset-0 before:rounded-2xl before:md:rounded-3xl 
                 before:bg-gradient-to-br before:from-white/10 before:to-transparent 
                 before:dark:from-white/5 before:dark:to-transparent
                 before:backdrop-blur-sm before:z-[-1]
                 overflow-hidden
                 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent dark:from-white/2 dark:to-transparent opacity-70 pointer-events-none"></div>
      {children}
    </motion.div>
  );
};

export default GlassCard;