import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';

// Define the API URL
const API_URL = 'http://localhost:5000/api';

// Define types
interface Message {
  _id: string;
  sender: string;
  senderType: 'user' | 'alumni';
  content: string;
  createdAt: string;
  readStatus: boolean;
}

interface ChatRoom {
  _id: string;
  alumni: {
    _id: string;
    id?: number; // For compatibility with frontend models
    numericId?: number; // For compatibility with numeric IDs
    name: string;
    email: string;
    company?: string;
    position?: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  isActive: boolean;
  unreadCount?: number;
}

interface UnreadCountResponse {
  [key: string]: number;
  totalUnread: number;
}

const ChatInterface = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processingAlumniId, setProcessingAlumniId] = useState(false);
  
  // Get URL parameters
  const params = new URLSearchParams(location.search);
  const alumniId = params.get('alumniId');
  const alumniName = params.get('alumniName');
  const alumniCompany = params.get('company');
  const alumniPosition = params.get('position');
  
  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/rooms`, {
        headers: {
          'x-auth-token': token
        }
      });
      setChatRooms(response.data);
      
      // If no room is selected and we have rooms, select the first one
      if (!currentRoomId && response.data.length > 0) {
        setCurrentRoomId(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to fetch chat rooms');
    }
  };
  
  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/unread`, {
        headers: {
          'x-auth-token': token
        }
      });
      setUnreadCounts(response.data);
      
      // Update chat rooms with unread counts
      if (chatRooms.length > 0) {
        const updatedRooms = chatRooms.map(room => {
          const roomCount = response.data[room._id];
          return {
            ...room,
            unreadCount: roomCount
          };
        });
        setChatRooms(updatedRooms);
      }
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };
  
  // Fetch alumni list
  const fetchAlumni = async () => {
    try {
      const response = await axios.get(`${API_URL}/alumni`, {
        headers: {
          'x-auth-token': token
        }
      });
      // setAlumni(response.data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
    }
  };

  // Fetch messages for current chat room
  const fetchMessages = async () => {
    if (!currentRoomId) return;
    
    try {
      if (!refreshing) {
        setRefreshing(true);
      }
      
      const response = await axios.get(`${API_URL}/chat/messages/${currentRoomId}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // Mark messages as read
      await axios.put(`${API_URL}/chat/messages/read/${currentRoomId}`, {}, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // Update unread counts
      fetchUnreadCounts();
      
      // Update messages
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Effect to load chat rooms on component mount
  useEffect(() => {
    if (token) {
      fetchChatRooms();
      fetchUnreadCounts();
      fetchAlumni();
    }
  }, [token]);
  
  // Effect to load messages when current room changes
  useEffect(() => {
    if (currentRoomId) {
      fetchMessages();
      
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentRoomId]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Create a new chat room with an alumni
  const createChatRoom = async (
    alumniId: string, 
    alumniName?: string | null, 
    alumniCompany?: string | null, 
    alumniPosition?: string | null
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Creating chat room with alumni ID:", alumniId);
      console.log("Alumni name:", alumniName);
      console.log("Auth token:", token);
      
      // First, check if we have a valid token
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // Check if we already have a chat room with this alumni to avoid duplicates
      const existingRoom = chatRooms.find(room => 
        (room.alumni._id === alumniId) || 
        (room.alumni.id !== undefined && room.alumni.id.toString() === alumniId) ||
        (room.alumni.numericId !== undefined && room.alumni.numericId.toString() === alumniId)
      );
      
      if (existingRoom) {
        console.log("Using existing chat room:", existingRoom._id);
        setCurrentRoomId(existingRoom._id);
        return;
      }
      
      const response = await axios.post(`${API_URL}/chat/rooms`, 
        { 
          alumniId,
          alumniName,
          alumniCompany,
          alumniPosition
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      console.log("Chat room created:", response.data);
      
      // Add the new room to our list, avoiding duplicates
      setChatRooms(prev => {
        // Check if the room already exists in the list
        const exists = prev.some(room => room._id === response.data._id);
        if (exists) {
          return prev; // Don't add duplicate
        }
        return [response.data, ...prev];
      });
      
      // Set this as the current room
      setCurrentRoomId(response.data._id);
      
      // Fetch messages for this room
      await fetchMessages();
    } catch (err: any) {
      console.error('Error creating chat room:', err);
      
      // Provide more specific error messages based on the error
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 400) {
          setError(`Failed to create chat room: ${err.response.data.msg || 'Bad request'}`);
        } else if (err.response.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (err.response.status === 404) {
          setError('Alumni not found. They may have been removed from the system.');
        } else {
          setError(`Failed to create chat room: ${err.response.data.msg || 'Server error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to create chat room. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Send a message
  const handleSendMessage = async () => {
    if (!currentRoomId || !newMessage.trim()) return;
    
    try {
      // Optimistically add message to UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        _id: tempId,
        sender: user?.id || '',
        senderType: user?.isAlumni ? 'alumni' : 'user',
        content: newMessage,
        createdAt: new Date().toISOString(),
        readStatus: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      scrollToBottom();
      
      // Send to server
      const response = await axios.post(`${API_URL}/chat/messages`, {
        roomId: currentRoomId,
        content: newMessage
      }, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // Replace temp message with actual message from server
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? response.data : msg)
      );
      
      // Update chat room list to show latest message
      setChatRooms(prev => 
        prev.map(room => 
          room._id === currentRoomId 
            ? { 
                ...room, 
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString()
              }
            : room
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Refresh data
  const handleRefresh = () => {
    fetchChatRooms();
    fetchUnreadCounts();
    if (currentRoomId) fetchMessages();
  };
  
  // Get the name of the other person in the chat
  const getChatPartnerName = (room: ChatRoom) => {
    if (user?.isAlumni) {
      return room.user.name;
    } else {
      return room.alumni.name;
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Display unread count badge in the UI
  const getTotalUnreadCount = () => {
    if (!unreadCounts) return 0;
    return unreadCounts.totalUnread;
  };

  // Effect to handle alumniId from URL
  useEffect(() => {
    const handleAlumniFromUrl = async () => {
      if (alumniId && token && !processingAlumniId) {
        console.log("Detected alumniId in URL:", alumniId);
        console.log("Alumni name from URL:", alumniName);
        
        // Set a flag to prevent multiple processing
        setProcessingAlumniId(true);
        
        try {
          // Check if we already have a chat room with this alumni
          const existingRoom = chatRooms.find(room => 
            room.alumni._id === alumniId || 
            (room.alumni.id !== undefined && room.alumni.id.toString() === alumniId) ||
            (room.alumni.numericId !== undefined && room.alumni.numericId.toString() === alumniId)
          );
          
          if (existingRoom) {
            console.log("Found existing chat room:", existingRoom);
            // Use existing room
            setCurrentRoomId(existingRoom._id);
          } else {
            console.log("Creating new chat room with alumni:", alumniId);
            // Create a new room with this alumni
            await createChatRoom(alumniId, alumniName, alumniCompany, alumniPosition);
          }
        } catch (error) {
          console.error("Error handling alumniId from URL:", error);
          setError("Failed to process alumni ID from URL");
        } finally {
          // Reset the flag
          setProcessingAlumniId(false);
        }
      }
    };
    
    handleAlumniFromUrl();
  }, [alumniId, token, alumniName, alumniCompany, alumniPosition]);

  if (!token) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">Please log in to access the chat feature.</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-gray-600">Chat with alumni and mentors</p>
      </div>
      
      {/* Show error message if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      <div className="flex flex-col h-[600px]">
        <div className="flex h-full">
          {/* Chat list sidebar */}
          <div className="w-1/3 border-r">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Conversations</h3>
                <button 
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Display total unread count if any */}
              {getTotalUnreadCount() > 0 && (
                <div className="mb-2 text-center">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getTotalUnreadCount()} unread
                  </span>
                </div>
              )}
              
              {/* New chat button */}
              <button 
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                onClick={() => navigate('/chat')}
              >
                New Chat
              </button>
              
              {/* Chat rooms list */}
              <div className="overflow-y-auto h-[450px]">
                {chatRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatRooms.map((room, index) => (
                      <div
                        key={`${room._id}-${index}`} // Use index to ensure uniqueness
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentRoomId === room._id 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentRoomId(room._id)}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-sm font-medium">
                            {getInitials(getChatPartnerName(room))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">
                                {getChatPartnerName(room)}
                              </p>
                              {room.unreadCount && room.unreadCount > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                  {room.unreadCount}
                                </span>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className={`text-xs truncate ${currentRoomId === room._id ? 'text-blue-100' : 'text-gray-500'}`}>
                                {room.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="w-2/3 flex flex-col">
            {error ? (
              <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            ) : !currentRoomId && !alumniId ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                <p className="text-gray-500 mb-4">
                  Select a conversation from the sidebar or start a new one
                </p>
                
                {/* Alumni list for new chats */}
                {/* {alumni.length > 0 && (
                  <div className="w-full max-w-md">
                    <h4 className="font-medium mb-2">Start a conversation with:</h4>
                    <div className="space-y-2">
                      {alumni.slice(0, 5).map((alum) => (
                        <div
                          key={alum._id}
                          className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center"
                          onClick={() => createChatRoom(alum._id)}
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-sm font-medium">
                            {getInitials(alum.name)}
                          </div>
                          <div>
                            <p className="font-medium">{alum.name}</p>
                            {alum.position && alum.company && (
                              <p className="text-xs text-gray-500">
                                {alum.position} at {alum.company}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            ) : loading && !messages.length ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                {chatRooms.length > 0 && currentRoomId && (
                  <div className="p-4 border-b flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-sm font-medium">
                      {getInitials(
                        getChatPartnerName(
                          chatRooms.find(room => room._id === currentRoomId)!
                        )
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getChatPartnerName(
                          chatRooms.find(room => room._id === currentRoomId)!
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.isAlumni ? 'Student' : 'Alumni'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Messages area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCurrentUser = 
                          (message.senderType === 'user' && !user?.isAlumni) ||
                          (message.senderType === 'alumni' && user?.isAlumni);
                        
                        return (
                          <div 
                            key={message._id} 
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isCurrentUser 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button 
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
