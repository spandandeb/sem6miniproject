import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, RefreshCw, PaperclipIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

// Define the API URL
const API_URL = 'http://localhost:5000/api';

interface Message {
  _id: string;
  sender: string;
  senderType: 'user' | 'alumni';
  content: string;
  readStatus: boolean;
  attachments: string[];
  createdAt: string;
}

interface ChatRoom {
  _id: string;
  alumni: {
    _id: string;
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
  totalUnread: number;
  roomCounts: {
    roomId: string;
    count: number;
  }[];
}

const ChatInterface = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse | null>(null);
  const [alumni, setAlumni] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get auth context
  const auth = useAuth();
  const currentUser = auth.user;
  
  // Get URL parameters
  const { alumniId } = useParams<{ alumniId?: string }>();
  const navigate = useNavigate();
  
  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/rooms`, {
        headers: {
          'x-auth-token': auth.token
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
          'x-auth-token': auth.token
        }
      });
      setUnreadCounts(response.data);
      
      // Update chat rooms with unread counts
      if (chatRooms.length > 0) {
        const updatedRooms = chatRooms.map(room => {
          const roomCount = response.data.roomCounts.find(
            count => count.roomId === room._id
          );
          return {
            ...room,
            unreadCount: roomCount ? roomCount.count : 0
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
          'x-auth-token': auth.token
        }
      });
      setAlumni(response.data);
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
          'x-auth-token': auth.token
        }
      });
      setMessages(response.data);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      
      // Scroll to bottom after messages load
      scrollToBottom();
      
      // Update unread counts after viewing messages
      fetchUnreadCounts();
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (auth.token) {
      fetchChatRooms();
      fetchUnreadCounts();
      fetchAlumni();
    }
  }, [auth.token]);
  
  // Fetch messages when room changes
  useEffect(() => {
    if (currentRoomId) {
      setLoading(true);
      fetchMessages();
    }
  }, [currentRoomId]);
  
  // Set up polling for new messages and unread counts
  useEffect(() => {
    if (!auth.token) return;
    
    const messageInterval = setInterval(() => {
      if (currentRoomId) {
        fetchMessages();
      }
    }, 10000); // Check for new messages every 10 seconds
    
    const unreadInterval = setInterval(() => {
      fetchUnreadCounts();
    }, 30000); // Check for unread counts every 30 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(messageInterval);
      clearInterval(unreadInterval);
    };
  }, [currentRoomId, auth.token]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Create a new chat room with an alumni
  const createChatRoom = async (alumniId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/chat/rooms`, 
        { alumniId },
        {
          headers: {
            'x-auth-token': auth.token
          }
        }
      );
      
      // Add the new room to our list
      setChatRooms(prev => [response.data, ...prev]);
      
      // Set this as the current room
      setCurrentRoomId(response.data._id);
      
      // Fetch messages for this room
      await fetchMessages();
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Failed to create chat room');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRoomId || !currentUser) return;

    try {
      // Create message data
      const messageData = {
        roomId: currentRoomId,
        content: newMessage,
      };
      
      // Add message optimistically to UI first for better UX
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: currentUser.id,
        senderType: 'user',
        content: newMessage,
        readStatus: false,
        attachments: [],
        createdAt: new Date().toISOString()
      };
      
      setMessages([...messages, optimisticMessage]);
      setNewMessage('');
      
      // Scroll to bottom after adding message
      setTimeout(scrollToBottom, 100);
      
      // Then try to save to API
      const response = await axios.post(`${API_URL}/chat/message`, messageData, {
        headers: {
          'x-auth-token': auth.token
        }
      });
      
      // Replace optimistic message with real one from server
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === optimisticMessage._id ? response.data : msg
        )
      );
      
      // Update chat rooms to reflect the new message
      fetchChatRooms();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    fetchMessages();
    fetchChatRooms();
    fetchUnreadCounts();
  };
  
  // Get the name of the other person in the chat
  const getChatPartnerName = (room: ChatRoom) => {
    if (!currentUser) return '';
    
    // If current user is alumni, show user name, otherwise show alumni name
    return currentUser.isAlumni 
      ? room.user.name 
      : room.alumni.name;
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Effect to handle alumniId from URL
  useEffect(() => {
    if (alumniId && auth.token) {
      // Check if we already have a chat room with this alumni
      const existingRoom = chatRooms.find(room => 
        room.alumni._id === alumniId || 
        (room.alumni.id && room.alumni.id.toString() === alumniId)
      );
      
      if (existingRoom) {
        // Use existing room
        setCurrentRoomId(existingRoom._id);
      } else {
        // Create a new room with this alumni
        createChatRoom(alumniId);
      }
    }
  }, [alumniId, chatRooms, auth.token]);

  if (!auth.token) {
    return (
      <Card className="glass-card card-3d-effect border-0">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <Alert>
              <AlertTitle>Not Authenticated</AlertTitle>
              <AlertDescription>
                Please log in to access the chat feature.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Messages</CardTitle>
        <CardDescription>
          Chat with alumni and mentors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chats">
          <TabsList className="mb-4">
            <TabsTrigger value="chats" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chats
              {unreadCounts && unreadCounts.totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCounts.totalUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-3 gap-4 h-[600px]">
            {/* Chat list sidebar */}
            <div className="col-span-1 border-r pr-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Conversations</h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {/* New chat button */}
              <Button 
                className="w-full mb-4"
                onClick={() => navigate('/chat')}
              >
                New Chat
              </Button>
              
              {/* Chat rooms list */}
              <ScrollArea className="h-[500px]">
                {chatRooms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatRooms.map((room) => (
                      <div
                        key={room._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentRoomId === room._id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setCurrentRoomId(room._id)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {getInitials(getChatPartnerName(room))}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">
                                {getChatPartnerName(room)}
                              </p>
                              {room.unreadCount && room.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-1">
                                  {room.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className="text-xs truncate opacity-70">
                                {room.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Chat area */}
            <div className="col-span-2 flex flex-col">
              {error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : !currentRoomId && !alumniId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a conversation from the sidebar or start a new one
                  </p>
                  
                  {/* Alumni list for new chats */}
                  {alumni.length > 0 && (
                    <div className="w-full max-w-md">
                      <h4 className="font-medium mb-2">Start a conversation with:</h4>
                      <div className="space-y-2">
                        {alumni.slice(0, 5).map((alum) => (
                          <div
                            key={alum._id}
                            className="p-3 rounded-lg cursor-pointer hover:bg-muted flex items-center"
                            onClick={() => createChatRoom(alum._id)}
                          >
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>
                                {getInitials(alum.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{alum.name}</p>
                              {alum.position && alum.company && (
                                <p className="text-xs text-muted-foreground">
                                  {alum.position} at {alum.company}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : loading && !messages.length ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  {chatRooms.length > 0 && currentRoomId && (
                    <div className="p-4 border-b flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {getInitials(
                            getChatPartnerName(
                              chatRooms.find(room => room._id === currentRoomId)!
                            )
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getChatPartnerName(
                            chatRooms.find(room => room._id === currentRoomId)!
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser?.isAlumni ? 'Student' : 'Alumni'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Messages area */}
                  <ScrollArea className="flex-1 p-4">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isCurrentUser = 
                            (message.senderType === 'user' && !currentUser?.isAlumni) ||
                            (message.senderType === 'alumni' && currentUser?.isAlumni);
                          
                          return (
                            <div 
                              key={message._id} 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isCurrentUser 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
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
                  </ScrollArea>
                  
                  {/* Message input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
