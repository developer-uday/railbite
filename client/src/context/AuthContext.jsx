import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔵 Login initiated with email:', email);
      console.log('🔵 API endpoint: /api/auth/login');
      
      const response = await authService.login(email, password);
      
      console.log('🟢 Login response:', response.status, response.data);
      const { token, user } = response.data;
      
      if (!token) {
        console.warn('⚠️ No token in response');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      console.log('🟢 User stored in state and localStorage');
      return user;
    } catch (err) {
      console.error('🔴 Login error:', err.response?.status, err.response?.data || err.message);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('🔵 Register initiated with data:', userData);
      console.log('🔵 API endpoint: /api/auth/register');
      
      const response = await authService.register(userData);
      
      console.log('🟢 Register response:', response.status, response.data);
      const { token, user } = response.data;
      
      if (!token) {
        console.warn('⚠️ No token in response');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      console.log('🟢 User stored in state and localStorage');
      return user;
    } catch (err) {
      console.error('🔴 Register error:', err.response?.status, err.response?.data || err.message);
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
