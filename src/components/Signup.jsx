import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/google-signup`, {
          token: tokenResponse.access_token,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user._id);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google signup error:', err);
        setError('Failed to sign up with Google. Please try again.');
      }
    },
    onError: () => {
      console.error('Google Signup Failed');
      setError('Google signup failed. Please try again.');
    },
  });

  const validateUsername = (value) => {
    if (value.length < 8) {
      setUsernameError('Username must be at least 8 characters long');
      return false;
    }
    if (!/^[a-z0-9]+$/.test(value)) {
      setUsernameError('Username must contain only lowercase letters and numbers');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, {
        username,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      await login(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.message === 'Invalid email address') {
          setEmailError('Please enter a valid email address');
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-home-image bg-cover bg-center">
      <Navbar isAuthPage={true} />
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6 text-caribbean-green">Sign Up</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className={`w-full px-3 py-2 border ${usernameError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green`}
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  validateUsername(e.target.value.toLowerCase());
                }}
                required
              />
              {usernameError && <p className="text-red-500 text-xs italic">{usernameError}</p>}
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green`}
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                required
              />
              {emailError && <p className="text-red-500 text-xs italic">{emailError}</p>}
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className={`w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green`}
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
              />
              {passwordError && <p className="text-red-500 text-xs italic">{passwordError}</p>}
            </div>
            <button
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md transition duration-300 hover:bg-caribbean-green hover:text-black hover:shadow-lg hover:shadow-caribbean-green/50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-caribbean-green hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
