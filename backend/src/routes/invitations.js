const express = require('express');
const { sendInvitations, getEventInvitations, handleRSVP, getInvitationByToken } = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes - only event creators can send invitations
router.post('/events/:eventId/invite', protect, sendInvitations);
router.get('/events/:eventId/invitations', protect, getEventInvitations);

// RSVP route - available to all authenticated users
router.put('/:invitationId/rsvp', protect, handleRSVP);

// Public route (for RSVP links in emails)
router.get('/token/:token', getInvitationByToken);

module.exports = router;