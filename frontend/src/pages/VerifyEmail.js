import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {error ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;