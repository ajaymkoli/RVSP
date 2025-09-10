const mongoose = require('mongoose');
const crypto = require('crypto');

const attendeeSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },
  checkedIn: {
    type: Boolean,
    default: false
  }
});

const eventSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  qrCodeData: {
    type: String,
    unique: true
  },
  qrCodeImage: {
    type: String
  },
  attendees: [attendeeSchema]
}, {
  timestamps: true
});

// Generate QR code data before saving
eventSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCodeData) {
    // Generate more secure QR code data
    this.qrCodeData = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Add creator as attendee when event is created
eventSchema.pre('save', function (next) {
  if (this.isNew) {
    this.attendees.push({
      guestId: this.creator,
      rsvpStatus: 'confirmed'
    });
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);