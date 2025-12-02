// components/CreditDisplay.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './ui/GlassCard';
import { motion } from 'framer-motion';

const CreditDisplay: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (!isAuthenticated || loading || !user) {
    return null; // Don't render if not authenticated or user data is loading/missing
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-1.5 md:p-2 text-xs md:text-sm flex items-center shadow-neon-gold">
        <span className="text-darkText dark:text-lightText font-bold">{user.credits} Credits</span>
      </GlassCard>
    </motion.div>
  );
};

export default CreditDisplay;
