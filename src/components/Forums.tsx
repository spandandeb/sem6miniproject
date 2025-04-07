import React, { useState, useEffect } from 'react';
import { Search, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import AlumniForum from './AlumniForum';

interface ForumUser {
  id: number;
  name: string;
  role: 'Student' | 'Alumni';
  profileImage?: string;
}

interface ForumInfo {
  id: number;
  alumniId: number;
  alumniName: string;
  alumniImage: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  participants: number;
}

interface ForumsProps {
  currentUser: ForumUser;
  activeForumId?: number;
}

const Forums: React.FC<ForumsProps> = ({ currentUser, activeForumId }) => {
  const [forums, setForums] = useState<ForumInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeForumIndex, setActiveForumIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch forums when component mounts
    fetchForums();
  }, []);

  useEffect(() => {
    // If activeForumId is provided, find and set the active forum
    if (activeForumId) {
      const index = forums.findIndex(forum => forum.alumniId === activeForumId);
      if (index !== -1) {
        setActiveForumIndex(index);
      }
    }
  }, [activeForumId, forums]);

  const fetchForums = () => {
    setIsLoading(true);
    // Simulate API call to fetch forums
    setTimeout(() => {
      // Sample forums for demo purposes
      const sampleForums: ForumInfo[] = [
        {
          id: 1,
          alumniId: 101,
          alumniName: "John Smith",
          alumniImage: "https://randomuser.me/api/portraits/men/32.jpg",
          lastMessage: "Welcome to our forum! Feel free to ask any questions.",
          lastMessageTime: new Date(Date.now() - 86400000), // 1 day ago
          unreadCount: 0,
          participants: 5
        },
        {
          id: 2,
          alumniId: 102,
          alumniName: "Sarah Johnson",
          alumniImage: "https://randomuser.me/api/portraits/women/44.jpg",
          lastMessage: "I'll be hosting a webinar on machine learning next week.",
          lastMessageTime: new Date(Date.now() - 3600000), // 1 hour ago
          unreadCount: 2,
          participants: 8
        },
        {
          id: 3,
          alumniId: 103,
          alumniName: "Raj Patel",
          alumniImage: "https://randomuser.me/api/portraits/men/22.jpg",
          lastMessage: "Let's discuss system design principles tomorrow.",
          lastMessageTime: new Date(Date.now() - 7200000), // 2 hours ago
          unreadCount: 0,
          participants: 6
        },
        {
          id: 4,
          alumniId: 104,
          alumniName: "Priya Sharma",
          alumniImage: "https://randomuser.me/api/portraits/women/28.jpg",
          lastMessage: "Check out this new design tool I found!",
          lastMessageTime: new Date(Date.now() - 43200000), // 12 hours ago
          unreadCount: 1,
          participants: 4
        },
        {
          id: 5,
          alumniId: 105,
          alumniName: "Rahul Mehta",
          alumniImage: "https://randomuser.me/api/portraits/men/42.jpg",
          lastMessage: "Here's the data analysis report we discussed.",
          lastMessageTime: new Date(Date.now() - 172800000), // 2 days ago
          unreadCount: 0,
          participants: 3
        }
      ];
      
      setForums(sampleForums);
      setIsLoading(false);
    }, 1000);
  };

  const handleForumClick = (index: number) => {
    setActiveForumIndex(index);
  };

  const handleBackToList = () => {
    setActiveForumIndex(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredForums = forums.filter(forum => 
    forum.alumniName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Forums</h1>
        <p className="text-gray-600">Chat with your mentors and peers</p>
      </div>
      
      {activeForumIndex !== null ? (
        // Active forum view
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center">
            <button 
              onClick={handleBackToList}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={forums[activeForumIndex].alumniImage} 
                  alt={forums[activeForumIndex].alumniName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-3">
                <h2 className="font-semibold">{forums[activeForumIndex].alumniName}'s Forum</h2>
                <p className="text-xs text-gray-500">{forums[activeForumIndex].participants} participants</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <AlumniForum 
              alumniId={forums[activeForumIndex].alumniId}
              alumniName={forums[activeForumIndex].alumniName}
              currentUser={currentUser}
              onClose={handleBackToList}
              embedded={true}
            />
          </div>
        </div>
      ) : (
        // Forums list view
        <>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search forums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredForums.length > 0 ? (
              <div className="divide-y">
                {filteredForums.map((forum, index) => (
                  <div 
                    key={forum.id}
                    onClick={() => handleForumClick(index)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={forum.alumniImage} 
                          alt={forum.alumniName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">{forum.alumniName}'s Forum</h3>
                          <span className="text-xs text-gray-500">{formatTime(forum.lastMessageTime)}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">{forum.lastMessage}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {forum.participants} participants
                          </div>
                          <div className="flex items-center text-xs text-gray-500 ml-4">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {forum.unreadCount > 0 && (
                              <span className="bg-indigo-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs ml-1">
                                {forum.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <Users className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-700">No forums found</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm ? "Try a different search term" : "Connect with alumni to join forums"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Forums;
