const express = require('express');
const { sendInvitations, getEventInvitations, handleRSVP, getInvitationByToken } = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Protected routes - only organizers can send invitations
router.post('/events/:eventId/invite', protect, authorize('organizer'), sendInvitations);
router.get('/events/:eventId/invitations', protect, authorize('organizer'), getEventInvitations);

// RSVP route - available to all authenticated users
router.put('/:invitationId/rsvp', protect, handleRSVP);

// Public route (for RSVP links in emails)
router.get('/token/:token', getInvitationByToken);

module.exports = router;