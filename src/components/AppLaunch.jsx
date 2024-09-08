import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Preloader from './Preloader';

function AppLaunch() {
  const navigate = useNavigate();
  const { currentUser, checkUser } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      await checkUser();
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };

    initializeApp();
  }, [navigate, currentUser, checkUser]);

  return <Preloader />;
}

export default AppLaunch;
