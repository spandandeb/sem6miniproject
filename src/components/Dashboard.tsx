import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Users, 
  ChevronRight,
  Star,
  X
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'message' | 'match' | 'event';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const Dashboard: React.FC = () => {
  // Mock user data (in a real app, this would come from authentication/API)
  const user = {
    name: 'Alex',
    mentorMatches: 3,
    upcomingEvents: 2,
    unreadMessages: 4
  };

  // Mock notifications data (in a real app, this would come from an API)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'match',
      title: 'New Mentor Match',
      description: 'You have been matched with Sarah Johnson, Senior Developer at Google',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      description: 'Raj Patel sent you a message about your career questions',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'event',
      title: 'Workshop Reminder',
      description: 'Resume Building Workshop starts in 2 days',
      time: 'Yesterday',
      read: true
    },
    {
      id: 4,
      type: 'match',
      title: 'Match Update',
      description: 'Your mentor request with Michael Chen has been accepted',
      time: '3 days ago',
      read: true
    }
  ]);

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Function to dismiss a notification
  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Get current time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Personalized greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {getTimeOfDay()}, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to your AlumniConnect dashboard. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mentor Matches</p>
                <p className="text-2xl font-bold text-gray-900">{user.mentorMatches}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{user.upcomingEvents}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{user.unreadMessages}</p>
              </div>
            </div>
          </div>

          {/* Suggested actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Meet your new mentor</p>
                    <p className="text-sm text-gray-500">Sarah Johnson is ready to connect with you</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Join upcoming workshop</p>
                    <p className="text-sm text-gray-500">Resume Building Workshop - April 8, 2025</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition cursor-pointer">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Complete your profile</p>
                    <p className="text-sm text-gray-500">Add your skills to improve mentor matching</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No notifications at this time</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg relative ${notification.read ? 'bg-gray-50' : 'bg-indigo-50 border-l-4 border-indigo-600'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center mb-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          notification.type === 'message' ? 'bg-purple-100' : 
                          notification.type === 'match' ? 'bg-indigo-100' : 'bg-blue-100'
                        }`}>
                          {notification.type === 'message' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                          {notification.type === 'match' && <Users className="h-4 w-4 text-indigo-600" />}
                          {notification.type === 'event' && <Calendar className="h-4 w-4 text-blue-600" />}
                        </div>
                        <span className="font-medium text-gray-900">{notification.title}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 ml-10">{notification.description}</p>
                    <p className="text-xs text-gray-500 mt-2 ml-10">{notification.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
