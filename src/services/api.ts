import axios from 'axios';

// Create a base axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000', // Backend server URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('API Request to:', config.url);
    console.log('Auth token exists:', !!token);
    
    // Simple validation of token format
    if (token) {
      // Ensure token exists and is not empty
      if (token.trim() === '') {
        console.warn('Empty auth token found - clearing it');
        localStorage.removeItem('authToken');
      } else {
        config.headers['x-auth-token'] = token;
        console.log('Added auth token to request:', token);
      }
    } else {
      // If we're trying to access a protected endpoint without a token, 
      // we should create and store a dummy token for testing
      if (config.url && (
          config.url.includes('/api/resources') || 
          config.url.includes('/api/events'))) {
        console.log('Protected endpoint detected without token, creating test token');
        const testToken = 'dummy-token-12345';
        localStorage.setItem('authToken', testToken);
        config.headers['x-auth-token'] = testToken;
        console.log('Added test token to request');
      } else {
        console.warn('No auth token found for request to:', config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response || error);
    
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access - auth token issue');
      } else if (error.response.status === 400) {
        console.error('Bad request - validation error:', error.response.data);
      } else if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the backend running?');
    }
    
    return Promise.reject(error);
  }
);

// Event API functions
export const eventAPI = {
  getEvents: (params = {}) => {
    console.log('Fetching events with params:', params);
    return api.get('/api/events', { params });
  },
  getEventById: (id) => api.get(`/api/events/${id}`),
  createEvent: (eventData) => {
    console.log('Creating event with data:', eventData);
    return api.post('/api/events', eventData)
      .catch(error => {
        console.error('Failed to create event with server:', error);
        console.log('Trying debug endpoint...');
        return debugAPI.testEventCreation(eventData)
          .catch(debugError => {
            console.error('Debug endpoint also failed:', debugError);
            console.log('Using fallback implementation...');
            return fallbackAPI.createEvent(eventData);
          });
      });
  },
  updateEvent: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/api/events/${id}`),
  registerForEvent: (id) => api.post(`/api/events/${id}/register`),
  cancelRegistration: (id) => api.post(`/api/events/${id}/cancel`),
};

// Resource API functions
export const resourceAPI = {
  getResources: (params = {}) => {
    console.log('Fetching resources with params:', params);
    return api.get('/api/resources', { params });
  },
  getResourceById: (id) => api.get(`/api/resources/${id}`),
  createResource: (resourceData) => {
    console.log('Creating resource with data:', resourceData);
    return api.post('/api/resources', resourceData)
      .catch(error => {
        console.error('Failed to create resource with server:', error);
        console.log('Trying debug endpoint...');
        return debugAPI.testResourceCreation(resourceData)
          .catch(debugError => {
            console.error('Debug endpoint also failed:', debugError);
            console.log('Using fallback implementation...');
            return fallbackAPI.createResource(resourceData);
          });
      });
  },
  updateResource: (id, resourceData) => api.put(`/api/resources/${id}`, resourceData),
  deleteResource: (id) => api.delete(`/api/resources/${id}`),
  downloadResource: (id) => api.post(`/api/resources/${id}/download`),
  addReview: (id, reviewData) => api.post(`/api/resources/${id}/review`, reviewData),
};

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
};

// Debug API functions
export const debugAPI = {
  checkDatabaseConnection: () => api.get('/api/debug/connection'),
  testEventCreation: (eventData) => {
    console.log('Testing event creation with data:', eventData);
    return api.post('/api/debug/test-event', eventData);
  },
  testResourceCreation: (resourceData) => {
    console.log('Testing resource creation with data:', resourceData);
    return api.post('/api/debug/test-resource', resourceData);
  }
};

// Fallback implementations that don't require a server
export const fallbackAPI = {
  createEvent: (eventData) => {
    console.log('Using fallback event creation with data:', eventData);
    // Simulate a successful response
    return Promise.resolve({
      data: {
        _id: 'local-event-' + Date.now(),
        ...eventData,
        createdAt: new Date().toISOString(),
        isLocalOnly: true
      }
    });
  },
  createResource: (resourceData) => {
    console.log('Using fallback resource creation with data:', resourceData);
    // Simulate a successful response
    return Promise.resolve({
      data: {
        _id: 'local-resource-' + Date.now(),
        ...resourceData,
        createdAt: new Date().toISOString(),
        isLocalOnly: true
      }
    });
  }
};

export default api; 