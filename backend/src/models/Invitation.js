const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'viewed', 'confirmed', 'declined', 'checked-in'],
    default: 'sent'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index to ensure one invitation per guest per event
invitationSchema.index({ eventId: 1, guestId: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);