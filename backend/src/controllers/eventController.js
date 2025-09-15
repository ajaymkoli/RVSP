const Event = require('../models/Event');
const User = require('../models/User');
const crypto = require('crypto');
const { generateEventQRCode } = require('../utils/qrGenerator');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    
    // Generate unique QR code data
    const qrCodeData = crypto.randomBytes(20).toString('hex');
    
    const event = await Event.create({
      creator: req.user.id,
      title,
      description,
      location,
      date,
      qrCodeData
    });
    
    // Populate creator details
    await event.populate('creator', 'username email');
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all events for a user
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { creator: req.user.id },
        { 'attendees.guestId': req.user.id }
      ]
    })
      .populate('creator', 'username email')
      .populate('attendees.guestId', 'username email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('attendees.guestId', 'username email');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has access to this event
    const isCreator = event.creator._id.toString() === req.user.id;
    const isAttendee = event.attendees.some(
      attendee => attendee.guestId._id.toString() === req.user.id
    );

    if (!isCreator && !isAttendee) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this event'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

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
        error: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('creator', 'username email')
      .populate('attendees.guestId', 'username email');

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

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
        error: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};