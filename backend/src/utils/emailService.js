const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send thank you email after registration
exports.sendThankYouEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Event Manager!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Event Manager, ${username}!</h2>
          <p>Thank you for registering with our Event Management System.</p>
          <p>We're excited to have you on board and can't wait to see the events you'll create!</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <br>
          <p>Best regards,</p>
          <p>The Event Manager Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Thank you email sent to:', email);
  } catch (error) {
    console.error('Error sending thank you email:', error);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Event Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested a password reset for your Event Manager account.</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>Best regards,</p>
          <p>The Event Manager Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Update the verification URL in sendVerificationEmail function
exports.sendVerificationEmail = async (email, verificationToken) => {
  try {
    // This should point to your frontend URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Event Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Verify Your Email Address</h2>
          <p>Thank you for registering with Event Manager!</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <br>
          <p>Best regards,</p>
          <p>The Event Manager Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Send invitation email
exports.sendInvitationEmail = async (email, event, token) => {
  try {
    const rsvpUrl = `${process.env.FRONTEND_URL}/rsvp/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">You're invited to ${event.title}</h2>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
          <p>Please RSVP by clicking the link below:</p>
          <a href="${rsvpUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">RSVP Now</a>
          <p>This link is unique to you. Please do not share it.</p>
          <br>
          <p>Best regards,</p>
          <p>The Event Manager Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', email);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};