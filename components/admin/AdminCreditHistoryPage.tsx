// components/admin/AdminCreditHistoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import GlassCard from '../ui/GlassCard';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { motion } from 'framer-motion';

const AdminCreditHistoryPage = () => {
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const [creditHistory, setCreditHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllCreditHistory = useCallback(async () => {
    if (!isAuthenticated || !authUser?.isAdmin) {
      setLoading(false);
      setError('Unauthorized access.');
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
      // Fetch credit history and users in parallel
      const [historyResponse, usersResponse] = await Promise.all([
        backendApi.getAllCreditHistory(token),
        backendApi.getAllUsers(token)
      ]);

      if (historyResponse.success) {
        setCreditHistory(historyResponse.data);
      } else {
        setError(historyResponse.message);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data);
      } else {
        setError(usersResponse.message || error);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load credit history data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser?.isAdmin) {
      fetchAllCreditHistory();
    }
  }, [authLoading, isAuthenticated, authUser, fetchAllCreditHistory]);

  const getTypeClasses = (type) => {
    switch (type) {
      case 'added': return 'bg-green-500/20 text-green-500';
      case 'deducted': return 'bg-red-500/20 text-red-500';
      default: return '';
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  if (authLoading || loading) {
    return (
      <AdminDashboardLayout title="Credit History">
        <Loader message="Loading credit history..." className="py-10" />
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Credit History">
        <p className="text-red-500 text-center py-10">{error}</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Credit History">
      <div className="mb-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View all credit transactions across all users.
        </p>
      </div>

      {creditHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No credit history found.
          </p>
        </div>
      ) : (
        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
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
                      {getUserName(entry.userId)}
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
        </GlassCard>
      )}
    </AdminDashboardLayout>
  );
};

export default AdminCreditHistoryPage;