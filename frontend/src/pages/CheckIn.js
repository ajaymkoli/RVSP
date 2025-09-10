import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import QRScanner from '../components/checkin/QRScanner';
import { checkinAPI } from '../api/checkin';

const CheckIn = () => {
  const { eventId } = useParams();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (data) => {
    if (!data || loading) return;

    setLoading(true);
    setScanning(false);

    try {
      // The Scanner component returns the scanned data directly
      // Parse the QR code data (should be in format: /checkin/eventId/qrCodeData)
      const parts = data.split('/');
      const qrCodeData = parts[parts.length - 1];

      // For now, we'll use a placeholder userId
      // In a real implementation, you'd need to get the userId from the QR code or user input
      const userId = prompt('Please enter the user ID to check in:');

      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        setScanning(true);
        return;
      }

      const response = await checkinAPI.checkInAttendee(eventId, qrCodeData, userId);
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error checking in attendee');
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    setError(`QR Scanner Error: ${error.message}`);
    console.error('QR Scanner Error:', error);
  };

  const resetScanner = () => {
    setScanning(true);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Check-in Attendees</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={resetScanner}
              className="ml-4 text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2">Processing check-in...</p>
          </div>
        )}

        {result && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold">Check-in Successful!</h3>
            <p>Attendee has been checked in successfully.</p>
            <button
              onClick={resetScanner}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Scan Another
            </button>
          </div>
        )}

        {scanning && !loading && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <QRScanner onScan={handleScan} onError={handleError} />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Position the QR code within the frame to scan
            </p>
          </div>
        )}

        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Manual Check-in</h2>
          <p className="text-sm text-gray-500 mb-4">
            If you're having trouble with the scanner, you can manually enter the check-in details.
          </p>
          <button
            onClick={() => {
              const userId = prompt('Please enter the user ID:');
              const qrCodeData = prompt('Please enter the QR code data:');

              if (userId && qrCodeData) {
                handleScan(`/checkin/${eventId}/${qrCodeData}`);
              }
            }}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Manual Check-in
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;