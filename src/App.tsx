import { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  GraduationCap,
  MessageSquare,
  Calendar,
  Star,
  LogOut,
  BookOpen
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MentorMatch from './components/MentorMatch';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                <Users className="h-6 w-6" />
                <span className="text-xl font-bold">AlumniConnect</span>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              {isLoggedIn && (
                <button 
                  className={`${activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-600 transition-colors font-medium`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
              )}
              <button 
                className={`${activeTab === 'mentors' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-600 transition-colors font-medium`}
                onClick={() => {
                  setActiveTab('mentors');
                  if (!isLoggedIn) setIsLoggedIn(true);
                }}
              >
                Mentors
              </button>
              <button 
                className={`${activeTab === 'resources' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-600 transition-colors font-medium`}
                onClick={() => setActiveTab('resources')}
              >
                Resources
              </button>
              <button 
                className={`${activeTab === 'forum' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-600 transition-colors font-medium`}
                onClick={() => setActiveTab('forum')}
              >
                Forum
              </button>
              <button 
                className={`${activeTab === 'events' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-600 transition-colors font-medium`}
                onClick={() => setActiveTab('events')}
              >
                Events
              </button>
              {isLoggedIn ? (
                <button 
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105 font-medium flex items-center"
                  onClick={() => {
                    setIsLoggedIn(false);
                    setActiveTab('home');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              ) : (
                <button 
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium"
                  onClick={() => {
                    setIsLoggedIn(true);
                    setActiveTab('dashboard');
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeTab === 'dashboard' && isLoggedIn ? (
        <Dashboard />
      ) : activeTab === 'mentors' && isLoggedIn ? (
        <MentorMatch />
      ) : activeTab === 'home' || !isLoggedIn ? (
        <div>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 -z-10" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Your Bridge to Professional Success
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                  Connect with alumni mentors, access career resources, and join a thriving community of professionals dedicated to helping you succeed
                </p>
                <div className="flex justify-center space-x-6">
                  <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center font-medium shadow-lg">
                    <Search className="mr-2 h-5 w-5" />
                    Find Mentors
                  </button>
                  <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all transform hover:scale-105 flex items-center font-medium shadow-lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Join Network
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow transform hover:-translate-y-1">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Matching</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our intelligent algorithm analyzes your goals, skills, and interests to connect you with alumni mentors who can make the biggest impact on your career journey.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow transform hover:-translate-y-1">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Career Resources</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access a comprehensive library of guides, templates, and tools curated by industry experts to accelerate your professional growth and development.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow transform hover:-translate-y-1">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Discussion Forum</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join a vibrant community where students and mentors engage in meaningful discussions about career development, industry trends, and professional growth.
                </p>
              </div>
            </div>
          </div>

          {/* Events and Workshops Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Upcoming Events &amp; Workshops
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Tech Career Workshop</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">Learn about the latest trends in tech careers and how to position yourself for success in the rapidly evolving industry.</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>March 15, 2024 • 2:00 PM PST</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
                    Register Now
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Resume Building Masterclass</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">Learn how to craft a compelling resume that stands out to recruiters and effectively showcases your skills and experience.</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>April 22, 2025 • 1:00 PM</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
                    Register Now
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Networking Strategies</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">Discover effective networking strategies to build meaningful professional relationships that can accelerate your career growth.</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>April 29, 2025 • 3:00 PM</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Mentors Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Featured Mentors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Senior Software Engineer at Google',
                  image: 'https://randomuser.me/api/portraits/women/44.jpg'
                },
                {
                  name: 'Michael Chen',
                  role: 'Product Manager at Microsoft',
                  image: 'https://randomuser.me/api/portraits/men/32.jpg'
                },
                {
                  name: 'Priya Patel',
                  role: 'Marketing Director at Apple',
                  image: 'https://randomuser.me/api/portraits/women/68.jpg'
                }
              ].map((mentor, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-center">
                  <div className="h-32 w-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-indigo-100">
                    <img src={mentor.image} alt={mentor.name} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{mentor.name}</h3>
                  <p className="text-gray-600 mb-6">
                    {mentor.role}
                  </p>
                  <div className="flex justify-center items-center text-yellow-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg">
                  <div className="text-5xl font-bold mb-4">2,500+</div>
                  <div className="text-lg font-medium text-indigo-100">Successful Matches</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg">
                  <div className="text-5xl font-bold mb-4">500+</div>
                  <div className="text-lg font-medium text-indigo-100">Active Mentors</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg">
                  <div className="text-5xl font-bold mb-4">200+</div>
                  <div className="text-lg font-medium text-indigo-100">Monthly Events</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg">
                  <div className="text-5xl font-bold mb-4">95%</div>
                  <div className="text-lg font-medium text-indigo-100">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page</h2>
          <p className="text-xl text-gray-600">This {activeTab} page is under construction.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                  <Users className="h-6 w-6" />
                  <span className="text-xl font-bold">AlumniConnect</span>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Building bridges between students and alumni for meaningful career connections and professional growth.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Find Mentors</li>
                <li className="hover:text-white transition-colors cursor-pointer">Career Resources</li>
                <li className="hover:text-white transition-colors cursor-pointer">Discussion Forum</li>
                <li className="hover:text-white transition-colors cursor-pointer">Events &amp; Workshops</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Resources</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Career Guides</li>
                <li className="hover:text-white transition-colors cursor-pointer">Resume Templates</li>
                <li className="hover:text-white transition-colors cursor-pointer">Interview Tips</li>
                <li className="hover:text-white transition-colors cursor-pointer">Industry Reports</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Contact</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">info@alumniconnect.com</li>
                <li className="hover:text-white transition-colors cursor-pointer">+1 (555) 123-4567</li>
                <li className="hover:text-white transition-colors cursor-pointer">123 Innovation Drive</li>
                <li className="hover:text-white transition-colors cursor-pointer">San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
