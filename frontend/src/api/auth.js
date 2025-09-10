import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const authAPI = {
  login: (email, password) => axios.post(`${API_URL}/login`, { email, password }),
  register: (username, email, password) => axios.post(`${API_URL}/register`, { username, email, password }),
  forgotPassword: (email) => axios.post(`${API_URL}/forgotpassword`, { email }),
  resetPassword: (token, password) => axios.put(`${API_URL}/resetpassword/${token}`, { password }),
  verifyEmail: (token) => axios.get(`${API_URL}/verify-email/${token}`)
};