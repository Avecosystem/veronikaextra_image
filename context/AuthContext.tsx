// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, ApiResponse } from '../types';
import { backendApi } from '../services/backendApi';
import { useNavigate } from 'react-router-dom';
import { generateDeviceId } from '../utils/deviceUtils';

export const AuthContext = createContext(undefined);

interface AuthProviderProps {
  children: any;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getToken = (): string | null => localStorage.getItem('jwt_token');
  const setToken = (token: string) => localStorage.setItem('jwt_token', token);
  const removeToken = () => localStorage.removeItem('jwt_token');

  const fetchUserProfile = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.getProfile(token);
      if (response.success) {
        setUser(response.data);
        return true;
      } else {
        setError(response.message || 'Failed to fetch user profile.');
        removeToken();
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('An unexpected error occurred while fetching user profile.');
      removeToken();
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.login(email, password);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.data);
        setError(null);
        navigate(response.data?.isAdmin ? '/admin/dashboard' : '/generator'); // Redirect admin to dashboard
        return true;
      } else {
        setError(response.message || 'Login failed.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signup = useCallback(async (name: string, email: string, password: string, country: string) => {
    setLoading(true);
    setError(null);
    try {
      // Generate device ID for device authentication
      const deviceId = generateDeviceId();
      
      const response = await backendApi.register(name, email, password, country, deviceId);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.data);
        setError(null);
        navigate('/generator');
        return true;
      } else {
        setError(response.message || 'Signup failed.');
        return false;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred during signup.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    const token = getToken();
    if (token) {
      backendApi.logout(token);
    }
    removeToken();
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  const updateUserCredits = useCallback((newCredits: number) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, credits: newCredits } : null));
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUserCredits,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};