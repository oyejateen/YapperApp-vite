import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token && userId && !currentUser) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [currentUser, setCurrentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;