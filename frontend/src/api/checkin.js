import axios from 'axios';

const API_URL = 'http://localhost:5000/api/checkin';

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

export const checkinAPI = {
  // Check in an attendee
  checkInAttendee: (eventId, qrCodeData, userId) => 
    api.post(`/events/${eventId}/checkin/${qrCodeData}`, { userId }),
  
  // Get check-in statistics for an event
  getCheckInStats: (eventId) => api.get(`/events/${eventId}/stats`),
};

export default checkinAPI;