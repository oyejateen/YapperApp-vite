import React from 'react';

function Comment({ comment }) {
  return (
    <div className="bg-gray-100 p-4 rounded-md mb-2">
      <p className="text-gray-800">{comment.content}</p>
      <p className="text-gray-500 text-sm mt-1">
        Posted by {comment.author ? comment.author.username : 'Anonymous'} on {new Date(comment.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default Comment;