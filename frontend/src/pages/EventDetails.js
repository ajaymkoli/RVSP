import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { invitationsAPI } from '../api/invitations';
import { checkinAPI } from '../api/checkin';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [checkInStats, setCheckInStats] = useState(null);
  const [myInvitation, setMyInvitation] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (event && !isOrganizer) {
      fetchMyInvitation();
    }
  }, [event]);

  const isOrganizer = event && event.creator && event.creator._id === user.id;

  useEffect(() => {
    if (event) {
      if (isOrganizer) {
        // Generate QR code for event check-in (organizer view)
        const qrCodeUrl = `${window.location.origin}/checkin/${id}`;
        setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`);
      } else if (myInvitation && myInvitation.status === 'confirmed') {
        // Generate QR code for attendee check-in
        const attendeeQrCodeUrl = `${window.location.origin}/checkin/attendee/${myInvitation.token}`;
        setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(attendeeQrCodeUrl)}`);
      }
    }
  }, [event, isOrganizer, myInvitation, id]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventsAPI.getEvent(id);
      setEvent(response.data.data);

      // If user is the event creator, fetch additional data
      if (response.data.data.creator._id === user.id) {
        fetchInvitations();
        fetchCheckInStats();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await invitationsAPI.getEventInvitations(id);
      setInvitations(response.data.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchCheckInStats = async () => {
    try {
      const response = await checkinAPI.getCheckInStats(id);
      setCheckInStats(response.data.data);
    } catch (error) {
      console.error('Error fetching check-in stats:', error);
    }
  };

  const handleSendInvitations = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
      await invitationsAPI.sendInvitations(id, emailList);
      setEmails('');
      setShowInviteForm(false);
      fetchInvitations(); // Refresh invitations list
      alert('Invitations sent successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending invitations');
    } finally {
      setSending(false);
    }
  };

  const fetchMyInvitation = async () => {
    try {
      // Use the new endpoint to get the user's own invitation
      const response = await invitationsAPI.getMyInvitation(id);
      setMyInvitation(response.data.data);
    } catch (error) {
      console.error('Error fetching user invitation:', error);
      setMyInvitation(null);
    }
  };

  const handleConfirm = async () => {
    try {
      await invitationsAPI.handleRSVP(myInvitation._id, 'confirmed');
      // Refresh the data
      fetchMyInvitation();
      alert('Attendance confirmed!');
    } catch (error) {
      setError(error.response?.data?.error || 'Error confirming attendance');
    }
  };

  const handleDecline = async () => {
    try {
      await invitationsAPI.handleRSVP(myInvitation._id, 'declined');
      // Refresh the data
      fetchMyInvitation();
      alert('Attendance declined.');
    } catch (error) {
      setError(error.response?.data?.error || 'Error declining invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">{error}</p>
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Event not found</p>
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>

        {/* Event Details Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{event.description}</p>
            <p className="mt-2 text-sm text-gray-500">
              Organized by: {event.creator.username}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{event.location}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(event.date).toLocaleString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Attendees</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event.attendees.length} guests invited
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Organizer Sections */}
        {isOrganizer && (
          <>
            {/* QR Code Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Check-in QR Code</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {qrCodeImage ? (
                  <div className="text-center">
                    <img src={qrCodeImage} alt="Event QR Code" className="mx-auto h-48 w-48" />
                    <p className="mt-2 text-sm text-gray-500">
                      Scan this code to check in attendees
                    </p>
                    <Link
                      to={`/checkin/${id}`}
                      className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Open Check-in Scanner
                    </Link>
                  </div>
                ) : (
                  <div>Loading QR code...</div>
                )}
              </div>
            </div>

            {/* Check-in Statistics Section */}
            {checkInStats && (
              <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Check-in Statistics</h2>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Total Attendees</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {checkInStats.totalAttendees}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Checked In</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {checkInStats.checkedInAttendees}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Check-in Rate</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {checkInStats.checkInRate.toFixed(1)}%
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Guest Invitations Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Guest Invitations</h2>
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {showInviteForm ? 'Cancel' : 'Invite Guests'}
                </button>
              </div>

              {showInviteForm && (
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <form onSubmit={handleSendInvitations}>
                    <div className="mb-4">
                      <label htmlFor="emails" className="block text-sm font-medium text-gray-700">
                        Guest Email Addresses
                      </label>
                      <textarea
                        id="emails"
                        name="emails"
                        rows={3}
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter email addresses, separated by commas"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Separate multiple email addresses with commas.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send Invitations'}
                    </button>
                  </form>
                </div>
              )}

              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <li key={invitation._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {invitation.guestId.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invitation.guestId.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 text-xs rounded-full ${invitation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
                              invitation.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {invitation.status}
                          </span>
                          {invitation.respondedAt && (
                            <span className="text-xs text-gray-500 mt-1">
                              Responded: {new Date(invitation.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Attendee View */}
        {!isOrganizer && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Your Invitation</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="text-center">
                {!myInvitation ? (
                  <p className="text-gray-500">Loading invitation details...</p>
                ) : myInvitation ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      You've been invited to this event by {event.creator.username}
                    </p>

                    {/* Add QR code for attendees */}
                    {myInvitation.status === 'confirmed' && qrCodeImage && (
                      <div className="mb-4">
                        <h3 className="text-md font-medium text-gray-900 mb-2">Your Check-in QR Code</h3>
                        <img src={qrCodeImage} alt="Personal QR Code" className="mx-auto h-48 w-48" />

                        {/* Display the token below the QR code */}
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Check-in Token:</p>
                          <p className="text-xs font-mono text-gray-900 break-all">{myInvitation.token}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Provide this token to event staff if QR code scanning is unavailable
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          Show this code at the event for check-in
                        </p>
                      </div>
                    )}

                    {myInvitation.status === 'confirmed' ? (
                      <p className="text-green-600 font-medium">You've confirmed your attendance!</p>
                    ) : myInvitation.status === 'declined' ? (
                      <p className="text-red-600 font-medium">You've declined this invitation.</p>
                    ) : (
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleConfirm}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Confirm Attendance
                        </button>
                        <button
                          onClick={handleDecline}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">You are not invited to this event.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;