import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function JoinCommunity() {
  const [error, setError] = useState('');
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinCommunity = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community/join/${inviteCode}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/community/${response.data.communityId}`);
      } catch (err) {
        setError('Failed to join community. The invite might be invalid or expired.');
      }
    };

    joinCommunity();
  }, [inviteCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {error ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Joining Community...</h2>
          <p>Please wait while we process your invitation.</p>
        </div>
      )}
    </div>
  );
}

export default JoinCommunity;