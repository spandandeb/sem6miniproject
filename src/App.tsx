import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MentorMatch from './components/MentorMatch';
import LoginPage from './pages/auth/LoginPage';
import Home from './pages/Home';

function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Users className="h-6 w-6" />
              <span className="text-xl font-bold">AlumniConnect</span>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            {isLoggedIn && (
              <button 
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            )}
            <button 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => navigate('/mentors')}
            >
              Mentors
            </button>
            <button 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => navigate('/resources')}
            >
              Resources
            </button>
            <button 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => navigate('/forum')}
            >
              Forum
            </button>
            <button 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => navigate('/events')}
            >
              Events
            </button>
            {isLoggedIn ? (
              <button 
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105 font-medium flex items-center"
                onClick={() => {
                  setIsLoggedIn(false);
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            ) : (
              <button 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentors" element={<MentorMatch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
