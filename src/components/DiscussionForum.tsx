import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Reply, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define the API URL
const API_URL = 'http://localhost:5000/api/forum';

interface Reply {
  _id?: string;
  content: string;
  user: string;
  username: string;
  avatar: string;
  createdAt: string;
}

interface Message {
  _id: string;
  content: string;
  user: string;
  username: string;
  avatar: string;
  replies: Reply[];
  createdAt: string;
}

const DiscussionForum: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get auth context
  const auth = useAuth();
  const currentUser = auth.user;
  
  // Mock data for fallback
  const mockMessages = [
    {
      _id: '1',
      content: 'Has anyone attended the workshop on AI Ethics? What were your thoughts?',
      user: '2',
      username: 'Alex Johnson',
      avatar: 'AJ',
      replies: [
        {
          _id: '101',
          content: 'It was really insightful! The speaker covered a lot of ground on bias in AI systems.',
          user: '3',
          username: 'Taylor Smith',
          avatar: 'TS',
          createdAt: '2025-03-29T14:30:00Z'
        }
      ],
      createdAt: '2025-03-29T12:00:00Z'
    },
    {
      _id: '2',
      content: 'I\'m looking for study partners for the upcoming data science hackathon. Anyone interested?',
      user: '4',
      username: 'Jordan Lee',
      avatar: 'JL',
      replies: [],
      createdAt: '2025-03-29T10:15:00Z'
    }
  ];

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      if (!refreshing) {
        setRefreshing(true);
      }
      
      try {
        const response = await axios.get(`${API_URL}/messages`);
        setMessages(response.data);
        setError(null);
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Only use mock data on initial load, not during refresh
        if (loading) {
          setMessages(mockMessages);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (loading) {
        setError('Failed to fetch messages');
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchMessages();
    
    // Set up polling to refresh messages every 10 seconds
    const intervalId = setInterval(fetchMessages, 10000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmitMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      // Create message object with username included
      const messageData = {
        content: newMessage,
        username: currentUser.name || 'User',
        avatar: (currentUser.name || '').substring(0, 2).toUpperCase() || 'U'
      };
      
      // Add message optimistically to UI first for better UX
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        ...messageData,
        user: currentUser.id,
        replies: [],
        createdAt: new Date().toISOString()
      };
      
      setMessages([optimisticMessage, ...messages]);
      setNewMessage('');
      
      // Then try to save to API
      try {
        const response = await axios.post(`${API_URL}/messages`, messageData, {
          headers: {
            'x-auth-token': auth.token || ''
          }
        });
        
        // Replace optimistic message with real one from server
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === optimisticMessage._id ? response.data : msg
          )
        );
        
        // Refresh messages to ensure consistency
        fetchMessages();
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Message is already in UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error posting message:', err);
      setError('Failed to post message');
    }
  };

  const handleSubmitReply = async (messageId: string) => {
    if (!replyContent.trim() || !currentUser) return;

    try {
      // Create reply object with username included
      const replyData = {
        content: replyContent,
        username: currentUser.name || 'User',
        avatar: (currentUser.name || '').substring(0, 2).toUpperCase() || 'U'
      };
      
      // Add reply optimistically to UI first for better UX
      const updatedMessages = messages.map(message => {
        if (message._id === messageId) {
          return {
            ...message,
            replies: [
              ...message.replies,
              {
                _id: `temp-${Date.now()}`,
                ...replyData,
                user: currentUser.id,
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return message;
      });
      
      setMessages(updatedMessages);
      setReplyContent('');
      setReplyingTo(null);
      
      // Then try to save to API
      try {
        const response = await axios.post(`${API_URL}/messages/${messageId}/replies`, replyData, {
          headers: {
            'x-auth-token': auth.token || ''
          }
        });
        
        // Update the message with the server response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId ? response.data : msg
          )
        );
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Reply is already in UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Remove message from UI first for better UX
      setMessages(messages.filter(message => message._id !== messageId));
      
      // Then try to delete from API
      try {
        await axios.delete(`${API_URL}/messages/${messageId}`, {
          headers: {
            'x-auth-token': auth.token || ''
          }
        });
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Message is already removed from UI, so we don't need to do anything on error
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md border-0">
          <div className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md border-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              <div>
                <h2 className="text-xl font-bold">Discussion Forum</h2>
                <p className="text-gray-500 text-sm">
                  Connect with other attendees, ask questions, and share your thoughts
                </p>
              </div>
            </div>
            <button 
              className="px-3 py-1 rounded border border-gray-300 text-sm flex items-center hover:bg-gray-50"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                {currentUser?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="text-sm font-medium">Posting as: {currentUser?.name || 'User'}</div>
            </div>
            <textarea
              placeholder="Start a new discussion..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleSubmitMessage} 
                disabled={!newMessage.trim() || !auth.token}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
              >
                Post <Send className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No discussions yet. Be the first to start one!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message._id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{message.username}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                        {message.user === currentUser?.id && (
                          <button 
                            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                            onClick={() => handleDeleteMessage(message._id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                      <p className="mt-2">{message.content}</p>
                      
                      <div className="mt-2">
                        <button 
                          className="text-xs text-gray-500 flex items-center hover:text-blue-600"
                          onClick={() => setReplyingTo(replyingTo === message._id ? null : message._id)}
                          disabled={!auth.token}
                        >
                          <Reply className="h-3 w-3 mr-1" /> Reply
                        </button>
                      </div>
                      
                      {replyingTo === message._id && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button 
                              className="px-3 py-1 border rounded text-sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                              onClick={() => handleSubmitReply(message._id)}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {message.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                          {message.replies.map((reply) => (
                            <div key={reply._id} className="flex items-start space-x-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                {reply.avatar}
                              </div>
                              <div>
                                <div className="flex items-baseline">
                                  <p className="font-medium text-sm">{reply.username}</p>
                                  <p className="text-xs text-gray-500 ml-2">
                                    {formatDate(reply.createdAt)}
                                  </p>
                                </div>
                                <p className="text-sm mt-1">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
