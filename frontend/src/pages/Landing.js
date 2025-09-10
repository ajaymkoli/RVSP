import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Manage Your Events <span className="text-indigo-600">Effortlessly</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Create events, send invitations, track RSVPs, and check-in attendees with our powerful event management platform.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md text-base font-medium border border-indigo-600 hover:bg-indigo-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Everything You Need for Event Management</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Event Creation</h3>
              <p className="text-gray-600">Create events in minutes with our intuitive event creation form.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Invitations</h3>
              <p className="text-gray-600">Send beautiful email invitations and track RSVPs in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Check-in</h3>
              <p className="text-gray-600">Quick and easy check-in process with QR code scanning.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;