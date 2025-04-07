import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  senderRole: 'Student' | 'Alumni';
  content: string;
  timestamp: Date;
}

interface ForumUser {
  id: number;
  name: string;
  role: 'Student' | 'Alumni';
  profileImage?: string;
}

interface AlumniForumProps {
  alumniId: number;
  alumniName: string;
  currentUser: ForumUser;
  onClose: () => void;
  embedded?: boolean;
}

const AlumniForum: React.FC<AlumniForumProps> = ({ alumniId, alumniName, currentUser, onClose, embedded = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<ForumUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages and participants when component mounts
  useEffect(() => {
    // In a real application, you would fetch these from an API
    fetchMessages();
    fetchParticipants();
  }, [alumniId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = () => {
    setIsLoading(true);
    // Simulate API call to fetch messages
    setTimeout(() => {
      // Sample messages for demo purposes
      const sampleMessages: Message[] = [
        {
          id: '1',
          senderId: alumniId,
          senderName: alumniName,
          senderRole: 'Alumni',
          content: 'Welcome to our forum! Feel free to ask any questions about the industry or career advice.',
          timestamp: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: '2',
          senderId: 201,
          senderName: 'Ankit Kumar',
          senderRole: 'Student',
          content: 'Thank you for accepting my connection request! I\'m interested in learning more about your experience in the field.',
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          id: '3',
          senderId: alumniId,
          senderName: alumniName,
          senderRole: 'Alumni',
          content: 'Happy to help! What specific areas are you interested in?',
          timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        {
          id: '4',
          senderId: 202,
          senderName: 'Sanya Patel',
          senderRole: 'Student',
          content: 'I\'m also curious about internship opportunities in your company. Do you have any advice for applying?',
          timestamp: new Date(Date.now() - 900000) // 15 minutes ago
        }
      ];
      setMessages(sampleMessages);
      setIsLoading(false);
    }, 1000);
  };

  const fetchParticipants = () => {
    // Simulate API call to fetch participants
    setTimeout(() => {
      // Sample participants for demo purposes
      const sampleParticipants: ForumUser[] = [
        {
          id: alumniId,
          name: alumniName,
          role: 'Alumni',
          profileImage: `https://randomuser.me/api/portraits/men/${alumniId % 100}.jpg`
        },
        {
          id: 201,
          name: 'Ankit Kumar',
          role: 'Student',
          profileImage: 'https://randomuser.me/api/portraits/men/76.jpg'
        },
        {
          id: 202,
          name: 'Sanya Patel',
          role: 'Student',
          profileImage: 'https://randomuser.me/api/portraits/women/65.jpg'
        },
        {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          profileImage: currentUser.profileImage
        }
      ];
      
      // Filter out duplicates (in case current user is already in the sample)
      const uniqueParticipants = sampleParticipants.filter(
        (participant, index, self) => 
          index === self.findIndex(p => p.id === participant.id)
      );
      
      setParticipants(uniqueParticipants);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: newMessage,
      timestamp: new Date()
    };
    
    // In a real application, you would send this to an API
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate sending to backend
    console.log('Sending message:', message);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return embedded ? (
    // Embedded version (no modal container)
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Messages section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  {message.senderId !== currentUser.id && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                  )}
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser.id 
                        ? 'bg-indigo-600 text-white' 
                        : message.senderRole === 'Alumni'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{message.senderName}</span>
                      <span className="ml-2 text-xs opacity-75">
                        {message.senderRole === 'Alumni' ? '(Mentor)' : '(Student)'}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                    <div className="text-xs mt-1 opacity-75 flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t p-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 flex items-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
        
        {/* Participants section */}
        <div className="w-64 border-l bg-gray-50 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-700">Participants ({participants.length})</h3>
          </div>
          <div className="p-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  {participant.profileImage ? (
                    <img 
                      src={participant.profileImage} 
                      alt={participant.name} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{participant.name}</div>
                  <div className="text-xs text-gray-500">{participant.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    // Modal version (with container)
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{alumniName}'s Forum</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Messages section */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`mb-4 flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.senderId !== currentUser.id && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                    )}
                    <div 
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser.id 
                          ? 'bg-indigo-600 text-white' 
                          : message.senderRole === 'Alumni'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{message.senderName}</span>
                        <span className="ml-2 text-xs opacity-75">
                          {message.senderRole === 'Alumni' ? '(Mentor)' : '(Student)'}
                        </span>
                      </div>
                      <p className="mt-1">{message.content}</p>
                      <div className="text-xs mt-1 opacity-75 flex items-center justify-end">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="border-t p-4 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 flex items-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          {/* Participants section */}
          <div className="w-64 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-700">Participants ({participants.length})</h3>
            </div>
            <div className="p-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    {participant.profileImage ? (
                      <img 
                        src={participant.profileImage} 
                        alt={participant.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{participant.name}</div>
                    <div className="text-xs text-gray-500">{participant.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniForum;
