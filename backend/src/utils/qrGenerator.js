const QRCode = require('qrcode');

// Generate QR code for an event
exports.generateEventQRCode = async (eventId, qrCodeData) => {
  try {
    // Create a URL that will be used for check-in
    const checkinUrl = `${process.env.FRONTEND_URL}/checkin/${eventId}/${qrCodeData}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(checkinUrl);
    
    return {
      qrCodeDataUrl,
      checkinUrl
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR code for an invitation
exports.generateInvitationQRCode = async (token) => {
  try {
    // Create a URL that will be used for RSVP
    const rsvpUrl = `${process.env.FRONTEND_URL}/rsvp/${token}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(rsvpUrl);
    
    return {
      qrCodeDataUrl,
      rsvpUrl
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};