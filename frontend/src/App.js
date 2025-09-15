import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import './App.css';
import VerifyEmail from './pages/VerifyEmail';
import EventDetails from './pages/EventDetails';
import RSVP from './pages/RVSP';
import CheckIn from './pages/CheckIn';
import Navbar from './components/common/Navbar';
import Profile from './pages/Profile';
import AttendeeQRCode from './pages/AttendeeQRCode';
import Landing from './pages/Landing';
import CreateEvent from './pages/CreateEvent';
import Invitations from './pages/Invitations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/events/:id" element={<PrivateRoute><EventDetails /> </PrivateRoute>} />
            <Route path="/rsvp/:token" element={<RSVP />} />
            <Route path="/checkin/:eventId" element={<PrivateRoute> <CheckIn /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/events/:eventId/qr-code" element={<PrivateRoute><AttendeeQRCode /></PrivateRoute>} />
            <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
            <Route path="/invitations" element={<PrivateRoute><Invitations /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;