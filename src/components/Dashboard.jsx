import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommunityCard from './CommunityCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('yourFeed');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationCarousel, setShowNotificationCarousel] = useState(false);

  useEffect(() => {
    const checkNotificationPermission = async () => {
      console.log('Checking notification permission');
      if ('Notification' in window) {
        console.log('Current permission:', Notification.permission);
        if (Notification.permission !== 'granted') {
          setShowNotificationCarousel(true);
        }
      } else {
        console.log('Notifications not supported in this browser');
      }
    };
    checkNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        console.log('Requesting notification permission');
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        if (permission === 'granted') {
          console.log('Notification permission granted');
          setShowNotificationCarousel(false);
          await subscribeToPushNotifications();
        } else {
          console.log('Notification permission denied');
          setShowNotificationCarousel(false);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      console.log('Subscribing to push notifications');
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        console.log('Push subscription created:', subscription);
        
        await sendSubscriptionToServer(subscription);
        
        console.log('User is subscribed to push notifications');
      } else {
        console.log('Service workers are not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Sending subscription to server');
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/notifications/subscribe`, 
        { subscription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Server response:', response.data);
      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error.response ? error.response.data : error);
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [allCommunitiesResponse, userCommunitiesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_URL}/api/community`),
          axios.get(`${import.meta.env.VITE_SERVER_URL}/api/community/user`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setCommunities(allCommunitiesResponse.data);
        setUserCommunities(userCommunitiesResponse.data);
      } catch (error) {
        console.error('Error fetching communities:', error.response || error);
        setError(error.response?.data?.message || 'Failed to fetch communities');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
  );

  const joinCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community/${communityId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.requestNotification) {
        await subscribeToPushNotifications();
      }
      // Update UI to reflect joined community
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showNotificationCarousel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Enable Notifications</h2>
            <p className="mb-6">Stay updated with the latest posts and activities in your communities.</p>
            <div className="flex justify-between">
              <button
                onClick={requestNotificationPermission}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Allow
              </button>
              <button
                onClick={() => setShowNotificationCarousel(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">YapperApp</h1>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-gray-900">Logout</button>
            </div>
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Logout</button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Communities</h2>
          <Link 
            to="/create-community" 
            className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center group"
          >
            <span className="hidden sm:inline" title='Create New Community'>Create New Community</span>
            <span className="sm:hidden">
              <FontAwesomeIcon icon={faPlus} />
            </span>
          </Link>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`mr-4 py-2 ${activeTab === 'yourFeed' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('yourFeed')}
            >
              Your Feed
            </button>
            <button
              className={`py-2 ${activeTab === 'explore' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('explore')}
            >
              Explore
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonLoader key={index} />
              ))}
            </div>
          ) : (
            activeTab === 'yourFeed' ? (
              userCommunities.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Find a community that suits your interests</h3>
                  <button 
                    onClick={() => setActiveTab('explore')} 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Explore Communities
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {userCommunities.map(community => (
                    <CommunityCard key={community._id} community={community} isMember={true} />
                  ))}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {communities.map(community => (
                  <CommunityCard key={community._id} community={community} isMember={userCommunities.some(uc => uc._id === community._id)} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;