const express = require('express');
const {
  checkInAttendee,
  getCheckInStats
} = require('../controllers/checkinController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/events/:eventId/checkin/:qrCodeData', checkInAttendee);
router.get('/events/:eventId/stats', getCheckInStats);

module.exports = router;