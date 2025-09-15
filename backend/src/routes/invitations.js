const express = require('express');
const { sendInvitations, getEventInvitations, handleRSVP, getInvitationByToken, getMyInvitation } = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes - only organizers can send invitations and view all invitations
router.post('/events/:eventId/invite', protect, sendInvitations);
router.get('/events/:eventId/invitations', protect, getEventInvitations);

// New route for users to get their own invitation
router.get('/events/:eventId/my-invitation', protect, getMyInvitation);

// RSVP route - available to all authenticated users
router.put('/:invitationId/rsvp', protect, handleRSVP);

// Public route (for RSVP links in emails)
router.get('/token/:token', getInvitationByToken);

module.exports = router;