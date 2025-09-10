const Event = require('../models/Event');
const Invitation = require('../models/Invitation');

// Check in an attendee using QR code
exports.checkInAttendee = async (req, res) => {
  try {
    const { eventId, qrCodeData } = req.params;
    const { userId } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Verify QR code data matches the event
    if (event.qrCodeData !== qrCodeData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code for this event'
      });
    }

    // Check if user is the event creator
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to check in attendees for this event'
      });
    }

    // Find the attendee in the event
    const attendee = event.attendees.find(
      a => a.guestId.toString() === userId
    );

    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Attendee not found for this event'
      });
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      return res.status(400).json({
        success: false,
        error: 'Attendee already checked in'
      });
    }

    // Update check-in status
    attendee.checkedIn = true;
    attendee.checkedInAt = new Date();
    
    // Update invitation status if exists
    await Invitation.findOneAndUpdate(
      { eventId, guestId: userId },
      { status: 'checked-in', respondedAt: new Date() }
    );

    await event.save();

    res.json({
      success: true,
      message: 'Attendee checked in successfully',
      data: attendee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get check-in statistics for an event
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

    // Check if user is the event creator
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view stats for this event'
      });
    }

    const totalAttendees = event.attendees.length;
    const checkedInAttendees = event.attendees.filter(a => a.checkedIn).length;
    const confirmedAttendees = event.attendees.filter(a => a.rsvpStatus === 'confirmed').length;

    res.json({
      success: true,
      data: {
        totalAttendees,
        checkedInAttendees,
        confirmedAttendees,
        checkInRate: totalAttendees > 0 ? (checkedInAttendees / totalAttendees) * 100 : 0
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};