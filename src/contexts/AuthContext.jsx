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
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    }
    setLoading(false);
  };

  const login = async (user) => {
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    checkUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}