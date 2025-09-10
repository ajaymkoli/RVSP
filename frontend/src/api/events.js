import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventsAPI = {
  // Create a new event
  createEvent: (eventData) => api.post('/', eventData),
  
  // Get all events for the current user
  getEvents: () => api.get('/'),
  
  // Get a single event
  getEvent: (id) => api.get(`/${id}`),
  
  // Update an event
  updateEvent: (id, eventData) => api.put(`/${id}`, eventData),
  
  // Delete an event
  deleteEvent: (id) => api.delete(`/${id}`),
};

export default eventsAPI;