import axios from 'axios';

const API_URL = 'http://localhost:5000/api/invitations';

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

export const invitationsAPI = {
  // Send invitations to guests
  sendInvitations: (eventId, emails) => api.post(`/events/${eventId}/invite`, { emails }),
  
  // Get invitations for an event (organizer only)
  getEventInvitations: (eventId) => api.get(`/events/${eventId}/invitations`),
  
  // Get user's own invitation for an event
  getMyInvitation: (eventId) => api.get(`/events/${eventId}/my-invitation`),
  
  // Handle RSVP response
  handleRSVP: (invitationId, status) => api.put(`/${invitationId}/rsvp`, { status }),
  
  // Get invitation by token (public)
  getInvitationByToken: (token) => api.get(`/token/${token}`),
};

export default invitationsAPI;