import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AlumniSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    company: '',
    position: '',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: ''
  });
  
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/');
    }
  }, [auth.isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (name in formErrors) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    // Validate graduation year
    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1950 || year > currentYear) {
        newErrors.graduationYear = 'Please enter a valid graduation year';
        valid = false;
      }
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await auth.registerAlumni({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        company: formData.company,
        position: formData.position,
        bio: formData.bio
      });
      
      // Redirect will happen automatically due to the useEffect
    } catch (error) {
      console.error('Alumni registration error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Alumni Sign up</h2>
          <p className="text-gray-500 text-sm">
            Create an alumni account to connect with students
          </p>
        </div>
        
        {auth.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error</h3>
            <p>{auth.error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
            <input 
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.name && (
              <p className="text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input 
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input 
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.password && (
              <p className="text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
            <input 
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="graduationYear" className="block text-sm font-medium">Graduation Year</label>
            <input 
              id="graduationYear"
              name="graduationYear"
              type="number"
              placeholder="2020"
              value={formData.graduationYear}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.graduationYear && (
              <p className="text-sm text-red-600">{formErrors.graduationYear}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium">Current Company</label>
            <input 
              id="company"
              name="company"
              type="text"
              placeholder="Google, Microsoft, etc."
              value={formData.company}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium">Current Position</label>
            <input 
              id="position"
              name="position"
              type="text"
              placeholder="Software Engineer, Product Manager, etc."
              value={formData.position}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
            <textarea 
              id="bio"
              name="bio"
              placeholder="Tell us about yourself, your experience, and how you can help students..."
              value={formData.bio}
              onChange={handleChange}
              disabled={auth.loading}
              className="w-full p-2 border rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
            disabled={auth.loading}
          >
            {auth.loading ? 'Signing up...' : 'Sign up as Alumni'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-2">
            Are you a student?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up as student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlumniSignup;
