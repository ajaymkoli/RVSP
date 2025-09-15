import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QRScanner = ({ onScan, onError }) => {
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for back camera

  const handleScan = (result) => {
    if (result) {
      // Extract the text from the result object
      const scannedText = result.text || result.rawValue || JSON.stringify(result);
      onScan(scannedText);
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner Error:', error);
    onError(error);
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode }}
          styles={{
            container: {
              width: '100%',
              height: '300px',
              position: 'relative'
            },
            video: {
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-green-500 rounded-lg w-64 h-64"></div>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={toggleCamera}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Switch Camera
        </button>
      </div>
    </div>
  );
};

export default QRScanner;