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
  // Scan QR code
  scanQRCode: (eventId, qrCodeData) => api.post('/scan-qr', { eventId, qrCodeData }),
  
  // Get check-in statistics
  getCheckInStats: (eventId) => api.get(`/stats/${eventId}`),
  
  // Check-in attendee by token
  checkInAttendee: (token) => api.post(`/attendee/${token}`),
};

export default checkinAPI;