import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Assuming your backend runs on port 5000
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
