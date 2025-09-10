const express = require('express');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  verifyEmail 
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;