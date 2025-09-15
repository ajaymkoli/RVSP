const Event = require('../models/Event');
const Invitation = require('../models/Invitation');

// Scan QR code for event check-in
exports.scanQRCode = async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    const { eventId } = req.params;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Verify the QR code data matches the event
    if (event.qrCodeData !== qrCodeData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code for this event'
      });
    }

    // Find the current user in the attendees list
    const attendeeIndex = event.attendees.findIndex(
      a => a.guestId.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'You are not invited to this event'
      });
    }

    // Update check-in status
    event.attendees[attendeeIndex].checkedIn = true;
    event.attendees[attendeeIndex].checkedInAt = new Date();
    
    await event.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: event.attendees[attendeeIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Check-in attendee by token (for organizer scanning attendee QR codes)
exports.checkInAttendee = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the invitation by token
    const invitation = await Invitation.findOne({ token })
      .populate('eventId')
      .populate('guestId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid QR code'
      });
    }

    // Check if the invitation is confirmed
    if (invitation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Attendance not confirmed'
      });
    }

    // Update the invitation status to checked-in
    invitation.status = 'checked-in';
    invitation.checkedInAt = new Date();
    await invitation.save();

    // Update the event attendee status
    const event = await Event.findById(invitation.eventId._id);
    const attendee = event.attendees.find(
      a => a.guestId.toString() === invitation.guestId._id.toString()
    );

    if (attendee) {
      attendee.checkedIn = true;
      attendee.checkedInAt = new Date();
      await event.save();
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        attendee: invitation.guestId,
        event: invitation.eventId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get check-in statistics
exports.getCheckInStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const totalAttendees = event.attendees.length;
    const checkedInAttendees = event.attendees.filter(a => a.checkedIn).length;
    const checkInRate = totalAttendees > 0 ? (checkedInAttendees / totalAttendees) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalAttendees,
        checkedInAttendees,
        checkInRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};