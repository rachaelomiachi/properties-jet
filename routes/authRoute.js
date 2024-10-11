const express = require('express');
const { registerUser, completeProfile, oauthRegister } = require('../controllers/authController');
const passport = require('passport');

const router = express.Router();

// Register user
router.post('/register', registerUser);

// Complete user profile
router.post('/complete-profile', completeProfile);

// OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), oauthRegister);

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), oauthRegister);

module.exports = router;
