import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  
  // If no user or user not verified, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If user exists but email is not verified, redirect to a verification prompt page
  if (!user.isVerified) {
    return <Navigate to="/verify-email" />;
  }
  
  return children;
};

export default PrivateRoute;