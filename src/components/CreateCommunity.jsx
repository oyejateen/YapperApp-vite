import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '../utils/api';
import Navbar from './Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faGlobe, faLock } from '@fortawesome/free-solid-svg-icons';

function CreateCommunity() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    profileImage: null,
    bannerImage: null,
    isPrivate: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isPrivate', formData.isPrivate);
      
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }
      if (formData.bannerImage) {
        formDataToSend.append('bannerImage', formData.bannerImage);
      }

      const token = localStorage.getItem('token');
      console.log("creating community with token:", token);
      console.log("creating community with data:", Object.fromEntries(formDataToSend));
      const response = await createCommunity(formDataToSend, token);
      console.log("community created:", response);
      navigate(`/community/${response._id}`);
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-home-image bg-cover bg-center">
      <Navbar showBackButton={true} isAuthPage={true} />
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-caribbean-green">Create a New Community</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative h-48 bg-gray-300 rounded-t-lg overflow-hidden">
              {formData.bannerImage ? (
                <img src={URL.createObjectURL(formData.bannerImage)} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FontAwesomeIcon icon={faCamera} className="text-4xl text-gray-500" />
                </div>
              )}
              <input
                type="file"
                id="bannerImage"
                name="bannerImage"
                onChange={handleInputChange}
                className="hidden"
                ref={bannerInputRef}
              />
              <label htmlFor="bannerImage" className="absolute top-2 right-2 bg-white p-2 rounded-full cursor-pointer">
                <FontAwesomeIcon icon={faCamera} />
              </label>
              <div className="absolute bottom-0 left-0 w-24 h-24 mb-[.5rem] ml-2">
                <div 
                  className="w-full h-full bg-gray-300 rounded-full overflow-hidden border-2 border-white cursor-pointer"
                  onClick={() => profileInputRef.current.click()}
                >
                  {formData.profileImage ? (
                    <img src={URL.createObjectURL(formData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FontAwesomeIcon icon={faCamera} className="text-3xl text-gray-500" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  onChange={handleInputChange}
                  className="hidden"
                  ref={profileInputRef}
                />
              </div>
            </div>

            <div className="mt-12">
              <input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Community Name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green" 
              />
            </div>

            <textarea 
              id="description" 
              name="description"
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Community Description"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean-green" 
            />

            <div>
              <h3 className="text-lg font-semibold mb-2">Community Visibility</h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                  className={`flex-1 py-2 px-4 rounded-full ${
                    !formData.isPrivate 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  } transition-colors duration-300`}
                >
                  <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                  className={`flex-1 py-2 px-4 rounded-full ${
                    formData.isPrivate 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  } transition-colors duration-300`}
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Private
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md transition duration-300 hover:bg-caribbean-green hover:text-black hover:shadow-lg hover:shadow-caribbean-green/50"
            >
              {isLoading ? 'Creating...' : 'Create Community'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCommunity;