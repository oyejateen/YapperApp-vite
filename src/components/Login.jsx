import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateInputs = () => {
    if (!emailOrUsername.trim()) {
      setError('Email or username is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        emailOrUsername,
        password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      await login(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to log in. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/google-login`, {
          access_token: tokenResponse.access_token,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user._id);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google login error:', err);
        setError('Failed to login with Google. Please try again.');
      }
    },
    onError: () => {
      console.error('Google Login Failed');
      setError('Google login failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen bg-home-image bg-cover bg-center">
      <Navbar isAuthPage={true} />
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6 text-caribbean-green">Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="emailOrUsername">
                Email or Username
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green"
                id="emailOrUsername"
                type="text"
                placeholder="Email or Username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md transition duration-300 hover:bg-caribbean-green hover:text-black hover:shadow-lg hover:shadow-caribbean-green/50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-caribbean-green hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
