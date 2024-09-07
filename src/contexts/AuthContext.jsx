import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setCurrentUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, { emailOrUsername, password });
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        setCurrentUser(response.data.user);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (username, email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, { username, email, password });
    localStorage.setItem('token', response.data.token);
    setCurrentUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}