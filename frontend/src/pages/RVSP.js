import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationsAPI } from '../api/invitations';

const RSVP = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await invitationsAPI.getInvitationByToken(token);
      setInvitation(response.data.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      setError('Please select an option');
      return;
    }

    setSubmitting(true);
    try {
      await invitationsAPI.handleRSVP(invitation._id, status);
      alert('Thank you for your response!');
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit RSVP');
    } finally {
      setSubmitting(false);
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

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Invitation not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Event Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You've been invited to: {invitation.eventId.title}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              <strong>Date:</strong> {new Date(invitation.eventId.date).toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              <strong>Location:</strong> {invitation.eventId.location}
            </p>
            {invitation.eventId.description && (
              <p className="mt-1 text-sm text-gray-500">
                <strong>Description:</strong> {invitation.eventId.description}
              </p>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Will you attend this event?
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="confirm"
                    name="rsvp"
                    type="radio"
                    value="confirmed"
                    checked={status === 'confirmed'}
                    onChange={() => setStatus('confirmed')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="confirm" className="ml-3 block text-sm font-medium text-gray-700">
                    Yes, I will attend
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="decline"
                    name="rsvp"
                    type="radio"
                    value="declined"
                    checked={status === 'declined'}
                    onChange={() => setStatus('declined')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="decline" className="ml-3 block text-sm font-medium text-gray-700">
                    No, I cannot attend
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting || !status}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RSVP;