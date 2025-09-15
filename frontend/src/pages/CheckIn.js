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
  const [manualToken, setManualToken] = useState('');

  const handleScan = async (data) => {
    if (!data || loading) return;

    setLoading(true);
    setScanning(false);

    try {
      console.log('Raw scanned data:', data);

      // The QR scanner is returning an array of objects
      // We need to extract the rawValue from the first object
      let scannedText;

      if (Array.isArray(data) && data.length > 0) {
        // Extract the rawValue from the first object in the array
        scannedText = data[0].rawValue;
      } else if (typeof data === 'object' && data.rawValue) {
        // Handle object format
        scannedText = data.rawValue;
      } else if (typeof data === 'string') {
        // Handle string format
        scannedText = data;
      } else {
        throw new Error('Unrecognized QR code format');
      }

      console.log('Extracted text:', scannedText);

      // Extract the token from the URL
      // The URL format is: http://localhost:3000/checkin/attendee/{token}
      const urlParts = scannedText.split('/');
      const token = urlParts[urlParts.length - 1];

      if (!token) {
        throw new Error('Could not extract token from QR code');
      }

      console.log('Extracted token:', token);

      // Use the token to check in the attendee
      const response = await checkinAPI.checkInAttendee(token);
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Error checking in attendee');
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
            Enter the attendee's token below or scan their QR code.
          </p>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter attendee token"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setManualToken(e.target.value)}
            />
            <button
              onClick={async () => {
                if (manualToken) {
                  try {
                    setLoading(true);
                    const response = await checkinAPI.checkInAttendee(manualToken);
                    setResult(response.data);
                    setError('');
                    setManualToken('');
                  } catch (error) {
                    setError(error.response?.data?.error || error.message || 'Error checking in attendee');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
            >
              Check In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;