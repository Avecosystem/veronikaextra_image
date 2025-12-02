// components/CreditHistoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './ui/GlassCard';
import Loader from './ui/Loader';
import { backendApi } from '../services/backendApi';
import { CreditHistory, ApiResponse } from '../types';

const CreditHistoryPage = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditHistory = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      const response: ApiResponse<CreditHistory[]> = await backendApi.getUserCreditHistory(token);
      if (response.success) {
        setCreditHistory(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching credit history:', err);
      setError('Failed to load credit history.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchCreditHistory();
    }
  }, [authLoading, isAuthenticated, user, fetchCreditHistory]);

  const getTypeClasses = (type: 'added' | 'deducted') => {
    switch (type) {
      case 'added': return 'bg-green-500/20 text-green-500';
      case 'deducted': return 'bg-red-500/20 text-red-500';
      default: return '';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader message="Loading credit history..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your credit history.</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Error</h2>
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8 min-h-[calc(100vh-160px)] animate-fade-in">
      <GlassCard className="w-full max-w-4xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-2">
          Credit History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          View your credit transactions and balance changes over time.
        </p>

        {creditHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No credit history found. Your credit transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 dark:divide-gray-200">
                {creditHistory.map((entry) => (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-darkText dark:text-lightText hover:bg-gray-800/20 dark:hover:bg-gray-200/20 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClasses(entry.type)}`}>
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {entry.amount} credits
                    </td>
                    <td className="px-6 py-4 text-sm break-words max-w-md">
                      {entry.description || '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default CreditHistoryPage;