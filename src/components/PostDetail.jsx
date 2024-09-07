import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Post from './Post';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [communityName, setCommunityName] = useState('');
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { postId } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('Invalid post ID');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/post/${postId}`);
        setPost(response.data);
        const communityResponse = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/community/${response.data.community}`);
        setCommunityName(communityResponse.data.name);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to fetch post');
      }
    };
    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/post/${postId}/comment`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data]
      }));
      setNewComment('');
      setShowCommentForm(false);
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to create comment');
    }
  };

  const truncateTitle = (title, maxLength = 20) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!post) return <div className="text-center">Loading...</div>;

  return (
    <>
      <Navbar showBackButton={true} />
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <nav className="text-sm font-medium mb-4">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to={`/community/${post.community}`} className="text-blue-500 hover:text-blue-600">{communityName}</Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li className="flex items-center">
              <span className="text-gray-500">Post</span>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            <li>
              <span className="text-gray-700">{truncateTitle(post.title)}</span>
            </li>
          </ol>
        </nav>
        <Post post={post} isDetailView={true} />
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Comments</h2>
            <button 
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Comment
            </button>
          </div>
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Write a comment..."
                rows="3"
              ></textarea>
              <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Submit Comment
              </button>
            </form>
          )}
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment._id} className="bg-white p-4 rounded-lg shadow mb-4">
                <p>{comment.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  By {comment.author ? comment.author.username : 'Anonymous'} on {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Start the Conversation!</h3>
              <p className="text-gray-600 mb-4">Be the first to comment on this post. Share your thoughts and engage with the community!</p>
              <button 
                onClick={() => setShowCommentForm(true)}
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Add the First Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PostDetail;