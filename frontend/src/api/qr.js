import axios from 'axios';

const API_URL = 'http://localhost:5000/api/qr';

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

export const qrAPI = {
  // Get attendee QR code
  getAttendeeQRCode: (eventId) => api.get(`/events/${eventId}/attendee-qr`),
  
  // Process QR code check-in
  processCheckIn: (qrData) => api.post('/checkin', { qrData }),
};

export default qrAPI;