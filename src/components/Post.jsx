import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faShare, faThumbTack } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Post({ post, updatePost, deletePost, isAdmin, isViewingIndividualPost = false }) {
  const [isLiked, setIsLiked] = useState(post.likedBy.includes(localStorage.getItem('userId')));
  const [isDisliked, setIsDisliked] = useState(post.dislikedBy.includes(localStorage.getItem('userId')));
  const [currentPost, setCurrentPost] = useState(post);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthor = currentPost.author && localStorage.getItem('userId') === currentPost.author._id;
  const authorName = currentPost.isAnonymous ? 'Anonymous' : (currentPost.author ? currentPost.author.username : 'Unknown');

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/post/${currentPost._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedPost = response.data;
      setIsLiked(updatedPost.likedBy.includes(localStorage.getItem('userId')));
      setIsDisliked(updatedPost.dislikedBy.includes(localStorage.getItem('userId')));
      setCurrentPost(updatedPost);
      if (updatePost && !isViewingIndividualPost) {
        updatePost(updatedPost);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/post/${currentPost._id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedPost = response.data;
      setIsLiked(updatedPost.likedBy.includes(localStorage.getItem('userId')));
      setIsDisliked(updatedPost.dislikedBy.includes(localStorage.getItem('userId')));
      setCurrentPost(updatedPost);
      if (updatePost && !isViewingIndividualPost) {
        updatePost(updatedPost);
      }
    } catch (err) {
      console.error('Error disliking post:', err);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`, { state: { post } });
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${post._id}`, { state: { post, scrollToComments: true } });
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this post on YapperApp: ${post.title}`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
        fallbackCopyToClipboard(shareUrl);
      }
    } else {
      fallbackCopyToClipboard(shareUrl);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Post link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const truncateContent = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/post/${post._id}/pin`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (updatePost) {
        updatePost(response.data);
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/api/post/${post._id}`, {
        title: editedTitle,
        content: editedContent
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (updatePost) {
        updatePost(response.data);
      }
      setIsEditing(false);
      // Update local state to reflect changes
      setEditedTitle(response.data.title);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div 
      className={`bg-white shadow-md rounded-lg p-6 mb-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${post.isPinned ? 'border-2 border-yellow-500' : ''}`}
      onClick={isEditing ? undefined : handlePostClick}
    >
      {isEditing ? (
        <form onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()} className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows="4"
            required
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
          </div>
        </form>
      ) : (
        <>
          {post.isPinned && (
            <div className="flex items-center text-yellow-500 mb-2">
              <FontAwesomeIcon icon={faThumbTack} className="mr-2" />
              <span className="font-semibold">Pinned Post</span>
            </div>
          )}
          <h2 className="text-xl font-bold mb-2">{isEditing ? editedTitle : post.title}</h2>
          <p className="text-gray-600 mb-4">
            {isEditing ? editedContent : truncateContent(post.content || '', 150)}
          </p>
          {post.media && post.media.length > 0 && (
            <div className="mt-4">
              {post.media.map((item, index) => (
                <div key={index} className="mb-2">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={`Post media ${index + 1}`} className="max-w-full h-auto rounded-lg" />
                  ) : item.type === 'video' ? (
                    <video controls className="max-w-full h-auto rounded-lg">
                      <source src={item.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              Posted by {authorName} on {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <button 
                onClick={handleLike}
                className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
              >
                <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                {post.likedBy.length}
              </button>
              <button 
                onClick={handleDislike}
                className={`flex items-center ${isDisliked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <FontAwesomeIcon icon={faThumbsDown} className="mr-1" />
                {post.dislikedBy.length}
              </button>
              <button 
                onClick={handleCommentClick}
                className="flex items-center text-gray-500 hover:text-blue-500"
              >
                <FontAwesomeIcon icon={faComment} className="mr-1" />
                {post.comments ? post.comments.length : 0}
              </button>
              <button 
                onClick={handleShareClick}
                className="flex items-center text-gray-500 hover:text-green-500"
              >
                <FontAwesomeIcon icon={faShare} />
              </button>
            </div>
            {(isAuthor || isAdmin) && (
              <div className="flex space-x-2">
                {isAdmin && (
                  <button
                    onClick={handleTogglePin}
                    className={`mr-2 ${post.isPinned ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500`}
                    title={post.isPinned ? 'Unpin Post' : 'Pin Post'}
                  >
                    <FontAwesomeIcon icon={faThumbTack} />
                  </button>
                )}
                {isAuthor && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Post"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); deletePost(post._id); }} 
                  className="text-red-500 hover:text-red-700"
                  title="Delete Post"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Post;