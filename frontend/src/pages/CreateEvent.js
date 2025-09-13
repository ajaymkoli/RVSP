import React from 'react';
import EventForm from '../components/events/EventForm';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleEventCreated = (newEvent) => {
    // Redirect to the event details page after creation
    navigate(`/events/${newEvent._id}`);
  };

  const handleCancel = () => {
    // Redirect back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventForm 
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateEvent;