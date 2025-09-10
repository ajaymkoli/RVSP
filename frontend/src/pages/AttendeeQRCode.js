import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { qrAPI } from '../api/qr';

const AttendeeQRCode = () => {
  const { eventId } = useParams();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQRCode();
  }, [eventId]);

  const fetchQRCode = async () => {
    try {
      const response = await qrAPI.getAttendeeQRCode(eventId);
      setQrCode(response.data.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching QR code');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
            <h1 className="text-xl font-bold">Your Event QR Code</h1>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">{qrCode.event.title}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(qrCode.event.date).toLocaleString()} • {qrCode.event.location}
              </p>
              <img src={qrCode.qrCodeImage} alt="Event QR Code" className="mx-auto h-64 w-64" />
              <p className="mt-4 text-sm text-gray-500">
                Show this QR code at the event entrance for check-in
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This QR code is unique to you and will expire after use
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeQRCode;