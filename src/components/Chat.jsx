import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faReply, faUser, faTrash, faFile, faImage, faVideo } from '@fortawesome/free-solid-svg-icons';

function Chat({ communityId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('isAnonymous', isAnonymous);
      if (replyTo) formData.append('replyTo', replyTo._id);
      if (file) formData.append('file', file);

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/chat/${communityId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      setReplyTo(null);
      setFile(null);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/chat/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.filter(message => message._id !== messageId));
    } catch (error) {
      console.error('Error deleting chat message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today, " + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday, " + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ", " + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const isCurrentUser = (message) => {
    const userId = localStorage.getItem('userId');
    return message.author && message.author._id === userId;
  };

  const groupMessagesByTime = (messages) => {
    const groups = [];
    let currentGroup = [];
    let lastTimestamp = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      if (!lastTimestamp || messageDate - lastTimestamp > 15 * 60 * 1000) { // 15 minutes interval
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
        lastTimestamp = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">
              Be the first to start the conversation!<br />
              Remember, messages here vanish after 2 days.
            </p>
          </div>
        ) : (
          groupMessagesByTime(messages).map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {formatDate(group[0].createdAt)}
                </span>
              </div>
              {group.map((message) => (
                <div key={message._id} className={`flex ${isCurrentUser(message) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser(message) ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded-lg p-3`}>
                    {message.replyTo && (
                      <div className="text-xs italic mb-2 border-l-2 pl-2">
                        Replying to: {message.replyTo.content.substring(0, 50)}...
                      </div>
                    )}
                    <p>{message.content}</p>
                    {message.file && (
                      <div className="mt-2">
                        {message.file.type === 'image' && (
                          <img src={message.file.url} alt="Uploaded" className="max-w-full rounded" />
                        )}
                        {message.file.type === 'video' && (
                          <video controls className="max-w-full rounded">
                            <source src={message.file.url} type={message.file.mimetype} />
                          </video>
                        )}
                        {message.file.type === 'document' && (
                          <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {message.file.url.split('/').pop()}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="text-xs mt-1">
                      {isCurrentUser(message) ? 'You' : (
                        message.isAnonymous ? 'Anonymous' : 
                        (message.author && message.author.username ? message.author.username : 'Unknown User')
                      )}
                    </div>
                    <div className="flex mt-2 space-x-2">
                      <button onClick={() => setReplyTo(message)} className="text-xs hover:underline">
                        <FontAwesomeIcon icon={faReply} /> Reply
                      </button>
                      {isCurrentUser(message) && (
                        <button onClick={() => handleDeleteMessage(message._id)} className="text-xs hover:underline text-red-500">
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
  {replyTo && (
    <div className="text-sm text-gray-600 mb-2">
      Replying to: {replyTo.content.substring(0, 50)}...
      <button onClick={() => setReplyTo(null)} className="ml-2 text-red-500">Cancel</button>
    </div>
  )}
  <div className="flex items-center">
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      className="flex-grow mr-2 p-2 border rounded-md resize-none"
      placeholder="Type a message..."
      rows="1"
      style={{ minHeight: '40px', maxHeight: '150px', overflowY: 'auto' }}
      onInput={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
    />
    <label htmlFor="file-upload" className="cursor-pointer mr-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors">
      <FontAwesomeIcon icon={faFile} />
    </label>
    <input
      id="file-upload"
      type="file"
      onChange={handleFileChange}
      className="hidden"
      accept="image/*,video/*,.pdf,.doc,.docx"
    />
    <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors">
      <FontAwesomeIcon icon={faPaperPlane} />
    </button>
  </div>
  {file && (
    <div className="mt-2 flex items-center">
      <FontAwesomeIcon 
        icon={file.type.startsWith('image/') ? faImage : file.type.startsWith('video/') ? faVideo : faFile} 
        className="mr-2"
      />
      <span className="text-sm">{file.name}</span>
      <button onClick={() => setFile(null)} className="ml-2 text-red-500">
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  )}
  <div className="flex items-center mt-2">
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isAnonymous}
        onChange={() => setIsAnonymous(!isAnonymous)}
        className="mr-2"
      />
      <FontAwesomeIcon icon={faUser} className="mr-1" />
      Be Anonymous
    </label>
  </div>
</form>

    </div>
  );
}

export default Chat;