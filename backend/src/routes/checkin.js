const express = require('express');
const { protect } = require('../middleware/auth');
const { scanQRCode, getCheckInStats, checkInAttendee } = require('../controllers/checkinController');

const router = express.Router();

router.post('/scan-qr', protect, scanQRCode);
router.get('/stats/:eventId', protect, getCheckInStats);
router.post('/attendee/:token', protect, checkInAttendee);

module.exports = router;