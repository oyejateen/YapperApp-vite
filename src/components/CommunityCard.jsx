import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faLock } from '@fortawesome/free-solid-svg-icons';

function CommunityCard({ community, isMember }) {
  const handleJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community/${community._id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      console.error('Error joining community:', err);
      if (err.response && err.response.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img src={community.bannerImage} alt={community.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 w-20 h-20 -mb-10 ml-4">
          <img src={community.profileImage} alt={community.name} className="w-full h-full rounded-full border-4 border-white object-cover" />
        </div>
      </div>
      <div className="p-6 pt-12">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          {community.name}
          <FontAwesomeIcon 
            icon={community.isPrivate ? faLock : faGlobe} 
            className={`ml-2 ${community.isPrivate ? 'text-gray-500' : 'text-gray-500'} text-xs`}
          />
        </h2>
        <p className="text-gray-600 mb-4">{community.description}</p>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Link to={`/community/${community._id}`} className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300 text-center">
            View Community
          </Link>
          {!isMember && (
            <button onClick={handleJoin} className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300">
              Join Community
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityCard;