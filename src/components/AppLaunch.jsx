import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Preloader from './Preloader';

function AppLaunch() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      console.log('Sending token:', token);

      if (token && userId) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Server response:', response.data);
          if (response.data) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('Error checking user:', error.response ? error.response.data : error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <Preloader />
  );
}

export default AppLaunch;
