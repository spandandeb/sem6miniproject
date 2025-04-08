import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = () => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call here
      login();
      console.log('Login successful');
      console.log('Token value after login:', localStorage.getItem('authToken'));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyTokenExists = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      alert(`Token exists: ${token}`);
      console.log('Current token:', token);
    } else {
      alert('No token found! You need to login first.');
      console.log('No token found in localStorage');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Login to AlumniConnect
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              disabled={isLoggingIn}
              // For demo purposes, we're not actually using this input
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              disabled={isLoggingIn}
              // For demo purposes, we're not actually using this input
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-md hover:from-indigo-700 hover:to-blue-700 transition-all"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
          
          <button
            onClick={verifyTokenExists}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-all mt-2"
          >
            Verify Token
          </button>
          
          <div className="text-center text-gray-600 text-sm mt-4">
            <p>For demo purposes, just click the Login button</p>
            <p>No actual credentials are required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 