import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setMessage('Check your email for a reset link');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Decorative bubbles */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-200 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full translate-x-32 translate-y-32 opacity-50"></div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-indigo-300 rounded-full opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 px-8">
            <h1 className="text-3xl font-bold text-white text-center">Event Manager</h1>
            <p className="text-indigo-100 text-center mt-2">Reset your password</p>
          </div>
          
          <div className="py-8 px-8">
            {message ? (
              <div className="text-center">
                <div className="text-green-600 mb-4">{message}</div>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Back to login</Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>

                <div className="text-center">
                  <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;