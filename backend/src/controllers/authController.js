const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendThankYouEmail, sendPasswordResetEmail, sendVerificationEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Email validation function
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    const user = await User.create({ 
      username, 
      email, 
      password,
      verificationToken
    });
    
    const token = generateToken(user._id);

    // Send thank you email
    await sendThankYouEmail(email, username);
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    const user = await User.findOne({ email });
    
    // Always return the same error message regardless of whether user exists (security best practice)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    const user = await User.findOne({ email });
    
    // Always return the same message regardless of whether user exists (security best practice)
    const message = 'If an account with that email exists, a password reset link has been sent';
    
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // Set reset token and expiry
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
      
      await user.save();
      
      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
    }
    
    res.json({ message });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body>
            <div style="text-align: center; padding: 50px;">
              <h2>Email Verification Failed</h2>
              <p>Invalid or expired verification token.</p>
              <a href="http://localhost:3000">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    
    await user.save();
    
    // Send the success HTML page
    const path = require('path');
    const fs = require('fs');
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, '../views/emailVerified.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    res.send(htmlContent);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send(`
      <html>
        <head><title>Verification Error</title></head>
        <body>
          <div style="text-align: center; padding: 50px;">
            <h2>Email Verification Error</h2>
            <p>An error occurred during verification. Please try again later.</p>
            <a href="http://localhost:3000">Go to Homepage</a>
          </div>
        </body>
      </html>
    `);
  }
};