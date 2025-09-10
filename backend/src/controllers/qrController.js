const Event = require('../models/Event');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Generate QR code for an attendee
exports.generateAttendeeQRCode = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is invited to the event
    const isInvited = event.attendees.some(
      attendee => attendee.guestId.toString() === userId
    );

    if (!isInvited) {
      return res.status(403).json({
        success: false,
        error: 'You are not invited to this event'
      });
    }

    // Generate unique check-in token
    const checkInToken = crypto.randomBytes(16).toString('hex');
    
    // Store check-in token in invitation
    await Invitation.findOneAndUpdate(
      { eventId, guestId: userId },
      { checkInToken }
    );

    // Generate QR code data
    const qrData = JSON.stringify({
      eventId: event._id,
      userId: userId,
      token: checkInToken,
      timestamp: Date.now()
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      success: true,
      data: {
        qrCodeImage,
        event: {
          title: event.title,
          date: event.date,
          location: event.location
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Verify and process QR code check-in
exports.processQRCheckIn = async (req, res) => {
  try {
    const { qrData } = req.body;

    // Parse QR code data
    const parsedData = JSON.parse(qrData);
    const { eventId, userId, token, timestamp } = parsedData;

    // Check if QR code is expired (5 minutes)
    if (Date.now() - timestamp > 300000) {
      return res.status(400).json({
        success: false,
        error: 'QR code has expired'
      });
    }

    // Verify the token
    const invitation = await Invitation.findOne({
      eventId,
      guestId: userId,
      checkInToken: token
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code'
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the event organizer
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only event organizers can check in attendees'
      });
    }

    // Update attendee status
    const attendee = event.attendees.find(
      a => a.guestId.toString() === userId
    );

    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Attendee not found'
      });
    }

    if (attendee.checkedIn) {
      return res.status(400).json({
        success: false,
        error: 'Attendee already checked in'
      });
    }

    attendee.checkedIn = true;
    attendee.checkedInAt = new Date();
    
    // Update invitation status
    invitation.status = 'checked-in';
    invitation.respondedAt = new Date();
    invitation.checkInToken = undefined; // Invalidate the token

    await Promise.all([event.save(), invitation.save()]);

    // Get user details
    const user = await User.findById(userId);

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        user: {
          username: user.username,
          email: user.email
        },
        checkedInAt: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};