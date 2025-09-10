const Invitation = require('../models/Invitation');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Send invitations to guests
exports.sendInvitations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { emails } = req.body;

    // Find the event
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
        error: 'Not authorized to send invitations for this event'
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      details: []
    };

    for (const email of emails) {
      try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
          results.details.push({ email, status: 'failed', error: 'User not found' });
          results.failed++;
          continue;
        }

        // Check if already invited
        const existingInvitation = await Invitation.findOne({
          eventId,
          guestId: user._id
        });

        if (existingInvitation) {
          results.details.push({ email, status: 'skipped', error: 'Already invited' });
          continue;
        }

        // Create invitation
        const token = crypto.randomBytes(20).toString('hex');
        const invitation = await Invitation.create({
          eventId,
          guestId: user._id,
          token
        });

        // Add to event attendees if not already there
        const isAlreadyAttendee = event.attendees.some(
          attendee => attendee.guestId.toString() === user._id.toString()
        );

        if (!isAlreadyAttendee) {
          event.attendees.push({
            guestId: user._id,
            rsvpStatus: 'pending'
          });
        }

        // Send invitation email
        await sendInvitationEmail(email, event, token);

        results.details.push({ email, status: 'sent' });
        results.sent++;
      } catch (error) {
        results.details.push({ email, status: 'failed', error: error.message });
        results.failed++;
      }
    }

    await event.save();

    res.json({
      success: true,
      message: `Invitations sent: ${results.sent}, Failed: ${results.failed}`,
      details: results.details
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all invitations for an event
exports.getEventInvitations = async (req, res) => {
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
        error: 'Not authorized to view invitations for this event'
      });
    }

    const invitations = await Invitation.find({ eventId })
      .populate('guestId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Handle RSVP response
exports.handleRSVP = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body;

    const invitation = await Invitation.findById(invitationId)
      .populate('eventId')
      .populate('guestId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    // Update invitation status
    invitation.status = status;
    invitation.respondedAt = new Date();
    await invitation.save();

    // Update event attendee status
    const event = await Event.findById(invitation.eventId._id);
    const attendee = event.attendees.find(
      a => a.guestId.toString() === invitation.guestId._id.toString()
    );

    if (attendee) {
      attendee.rsvpStatus = status;
      await event.save();
    }

    res.json({
      success: true,
      message: `RSVP ${status} successfully`,
      data: invitation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get invitation by token (for public RSVP page)
exports.getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('eventId')
      .populate('guestId', 'username email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invitation token'
      });
    }

    // Update status to viewed if it's the first time
    if (invitation.status === 'sent') {
      invitation.status = 'viewed';
      await invitation.save();
    }

    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};