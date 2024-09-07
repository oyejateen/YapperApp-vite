import React, { useEffect, useState, lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './components/PrivateRoute.jsx';
import Preloader from './components/Preloader.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
const Home = lazy(() => import('./components/Home.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Signup = lazy(() => import('./components/Signup.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const CreateCommunity = lazy(() => import('./components/CreateCommunity.jsx'));
const CommunityView = lazy(() => import('./components/CommunityView.jsx'));
const About = lazy(() => import('./components/About.jsx'));
const PostDetail = lazy(() => import('./components/PostDetail.jsx'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./components/TermsOfService.jsx'));
const JoinCommunity = lazy(() => import('./components/JoinCommunity.jsx'));
const AppLaunch = lazy(() => import('./components/AppLaunch.jsx'));

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Google One Tap setup
    if (!user) {
      const { google } = window;
      if (google) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap is not displayed');
          }
        });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/google-one-tap`, {
        credential: response.credential,
      });
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google One Tap error:', error);
      // You might want to show an error message to the user here
      // For example, using a toast notification or setting an error state
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/create-community" element={
          <PrivateRoute>
            <CreateCommunity />
          </PrivateRoute>
        } />
        <Route path="/community/:id" element={
          <PrivateRoute>
            <CommunityView />
          </PrivateRoute>
        } />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/join/:inviteCode" element={
          <PrivateRoute>
            <JoinCommunity />
          </PrivateRoute>
        } />
        <Route path="/app-launch" element={<AppLaunch />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/tos" element={<TermsOfService />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Suspense fallback={<Preloader />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
