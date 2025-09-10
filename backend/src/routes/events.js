const express = require('express');
const { createEvent, getUserEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserEvents)
  .post(authorize('organizer'), createEvent); // Only organizers can create events

router.route('/:id')
  .get(getEvent)
  .put(authorize('organizer'), updateEvent) // Only organizers can update events
  .delete(authorize('organizer'), deleteEvent); // Only organizers can delete events

module.exports = router;