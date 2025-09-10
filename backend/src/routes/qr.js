const express = require('express');
const { generateAttendeeQRCode, processQRCheckIn } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Generate QR code for attendee
router.get('/events/:eventId/attendee-qr', protect, generateAttendeeQRCode);

// Process QR code check-in (organizer only)
router.post('/checkin', protect, authorize('organizer'), processQRCheckIn);

module.exports = router;