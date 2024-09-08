import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Preloader from './Preloader';
import Post from './Post';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faShare, faPlus, faUserPlus, faSignOutAlt, faGlobe, faLock, faCloudUploadAlt, faTimes, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';

function CommunityView() {
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', isAnonymous: false, media: null, postType: 'text' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCommunity, setEditedCommunity] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [inviteCode, setInviteCode] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_SERVER_URL}`);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket == null) return;

    socket.emit('joinCommunity', id);

    socket.on('postCreated', handlePostCreated);
    socket.on('postUpdated', handlePostUpdated);
    socket.on('postDeleted', handlePostDeleted);

    return () => {
      socket.off('postCreated', handlePostCreated);
      socket.off('postUpdated', handlePostUpdated);
      socket.off('postDeleted', handlePostDeleted);
    };
  }, [socket, id]);

  const handlePostCreated = useCallback((newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  const handlePostUpdated = useCallback((updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  }, []);

  const handlePostDeleted = useCallback((deletedPostId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
  }, []);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/community/${id}`);
        setCommunity(response.data);
        setEditedCommunity(response.data);
        setPosts(response.data.posts || []);
        setUserId(localStorage.getItem('userId'));
        if (response.data.inviteCode) {
          setInviteCode(response.data.inviteCode);
        } else {
          console.error('Invite code not found for community');
        }
        setIsMember(response.data.members.includes(userId));
      } catch (err) {
        console.error('Failed to fetch community:', err);
        setError('Failed to fetch community');
      }
    };
    fetchCommunity();
  }, [id, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('isAnonymous', newPost.isAnonymous);
      formData.append('postType', newPost.postType);

      if (newPost.postType === 'text') {
        formData.append('content', newPost.content);
      } else if (newPost.postType === 'media' && newPost.media) {
        formData.append('media', newPost.media);
      } else {
        throw new Error('Invalid post type or missing media');
      }

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/post/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log('New post created:', response.data);
      // The socket will handle adding the new post to the state
      setNewPost({ title: '', content: '', isAnonymous: false, media: null, postType: 'text' });
      setShowCreatePost(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePost = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const deletePost = async (postId) => {
    try {
      console.log('Deleting post:', postId);
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/post/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err.response?.data || err.message);
      setError('Failed to delete post: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditCommunity = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!isAdmin) {
      setError('You are not authorized to edit this community');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/community/${id}`, editedCommunity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunity(response.data);
      setEditedCommunity(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error editing community:', err);
      setError('Failed to edit community: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCommunity = async () => {
    if (!isAdmin) {
      setError('You are not authorized to delete this community');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting community:', err);
      setError('Failed to delete community: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShareCommunity = async () => {
    if (community && community.inviteCode) {
      const inviteLink = `${window.location.origin}/join/${community.inviteCode}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Join ${community.name} on YapperApp`,
            text: `I invite you to join our community on YapperApp!`,
            url: inviteLink
          });
        } catch (err) {
          console.error('Error sharing:', err);
          fallbackCopyToClipboard(inviteLink);
        }
      } else {
        fallbackCopyToClipboard(inviteLink);
      }
    } else {
      console.error('Invite code not available');
      setError('Unable to generate invite link. Please try again later.');
    }
  };

  const fallbackCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Invite link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleJoinCommunity = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMember(true);
      window.location.reload();
    } catch (err) {
      console.error('Error joining community:', err);
      setError('Failed to join community: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMember(false);
      window.location.reload();
    } catch (err) {
      console.error('Error leaving community:', err);
      setError('Failed to leave community: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!community) return <Preloader />;

  const isAdmin = userId && community.admin === userId;

  return (
    <>
      <Navbar showBackButton={true} />
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative">
            <img src={community.bannerImage} alt={community.name} className="w-full h-64 object-cover" />
            <div className="absolute bottom-0 left-0 w-32 h-32 -mb-16 ml-8">
              <img src={community.profileImage} alt={community.name} className="w-full h-full rounded-full border-4 border-white object-cover" />
            </div>
          </div>
          <div className="mt-20 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  {community.name}
                </h1>
                <p className="text-gray-600 mt-2">{community.description}</p>
              </div>
              <div className="flex space-x-2">
                <div className="hidden sm:flex space-x-2">
                  {isAdmin && (
                    <>
                      <button onClick={handleEditCommunity} className="text-gray-600 hover:text-blue-500 transition-colors" title='Edit Community'>
                        <FontAwesomeIcon icon={faEdit} size="lg" />
                      </button>
                      <button onClick={handleDeleteCommunity} className="text-gray-600 hover:text-red-500 transition-colors" title='Delete Community'>
                        <FontAwesomeIcon icon={faTrash} size="lg" />
                      </button>
                    </>
                  )}
                  <button onClick={handleShareCommunity} className="text-gray-600 hover:text-green-500 transition-colors" title='Share Community'>
                    <FontAwesomeIcon icon={faShare} size="lg" />
                  </button>
                  {!isMember && (
                    <button 
                      onClick={handleJoinCommunity} 
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                      title="Join Community"
                    >
                      <FontAwesomeIcon icon={faUserPlus} size="lg" />
                    </button>
                  )}
                  {isMember && !isAdmin && (
                    <button 
                      onClick={handleLeaveCommunity} 
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Leave Community"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                    </button>
                  )}
                </div>
                <div className="sm:hidden relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} size="lg" />
                  </button>
                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 bg-black opacity-50 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                        {isAdmin && (
                          <>
                            <button onClick={handleEditCommunity} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Community
                            </button>
                            <button onClick={handleDeleteCommunity} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Community
                            </button>
                          </>
                        )}
                        <button onClick={handleShareCommunity} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FontAwesomeIcon icon={faShare} className="mr-2" /> Share Community
                        </button>
                        {!isMember && (
                          <button onClick={handleJoinCommunity} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Join Community
                          </button>
                        )}
                        {isMember && !isAdmin && (
                          <button onClick={handleLeaveCommunity} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Leave Community
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="mt-4">
                <input
                  type="text"
                  value={editedCommunity.name}
                  onChange={(e) => setEditedCommunity({...editedCommunity, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <textarea
                  value={editedCommunity.description}
                  onChange={(e) => setEditedCommunity({...editedCommunity, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveEdit} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <button
                className={`mr-4 py-2 ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button
                className={`py-2 ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
            </div>
            {activeTab === 'posts' && (
              <button 
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create Post
              </button>
            )}
          </div>
          {activeTab === 'posts' ? (
            <>
              {showCreatePost && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Post Title"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setNewPost({ ...newPost, postType: 'text' })}
                      className={`flex-1 py-2 px-4 rounded-full ${
                        newPost.postType === 'text' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      } transition-colors duration-300`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPost({ ...newPost, postType: 'media' })}
                      className={`flex-1 py-2 px-4 rounded-full ${
                        newPost.postType === 'media' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      } transition-colors duration-300`}
                    >
                      Media
                    </button>
                  </div>
                  {newPost.postType === 'text' ? (
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Post Content"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  ) : (
                    <div className="border rounded-md p-4">
                      {newPost.media ? (
                        <div className="relative">
                          {newPost.media.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(newPost.media)}
                              alt="Uploaded media"
                              className="max-w-full h-auto rounded-md"
                              style={{ maxHeight: '300px', width: 'auto' }}
                            />
                          ) : (
                            <video
                              src={URL.createObjectURL(newPost.media)}
                              controls
                              className="max-w-full h-auto rounded-md"
                              style={{ maxHeight: '300px', width: 'auto' }}
                            />
                          )}
                          <button
                            onClick={() => setNewPost({ ...newPost, media: null })}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <label htmlFor="media-upload" className="cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-8">
                              <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-400 mb-2" />
                              <p className="text-gray-500">Click to upload image or video</p>
                              <p className="text-sm text-gray-400 mt-1">Max file size: 30MB. Supported formats: JPG, PNG, MP4, MOV</p>
                            </div>
                          </label>
                          <input
                            id="media-upload"
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 30 * 1024 * 1024) {
                                  alert('File size exceeds 30MB limit');
                                } else {
                                  setNewPost({ ...newPost, media: file });
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newPost.isAnonymous}
                        onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                        className="form-checkbox"
                      />
                      <span className="ml-2">Post Anonymously</span>
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </button>
                </form>
              )}
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts
                    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                    .map(post => (
                      <Post 
                        key={post._id} 
                        post={{...post, content: post.content || ''}} 
                        updatePost={updatePost} 
                        deletePost={deletePost} 
                        isAdmin={isAdmin} 
                        isAuthor={post.author && post.author._id === userId} 
                        isViewingIndividualPost={false}
                      />
                    ))
                ) : (
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-2">Be the First to Post!</h3>
                    <p className="text-gray-600 mb-4">This community is waiting for its first post. Why not be the one to start the conversation?</p>
                    <button 
                      onClick={() => setShowCreatePost(true)}
                      className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Create the First Post
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
              <Chat communityId={id} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CommunityView;