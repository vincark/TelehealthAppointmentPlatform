const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/email');

// Step 1: Redirect to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Step 2: Google redirects back to the app
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      console.log('Auth error:', err);
      console.log('Auth user:', user);
      console.log('Auth info:', info);
      
      if (err || !user) {
        return res.redirect('http://localhost:5173/login?error=google_failed');
      }
      
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.log('Login error:', loginErr);
          return res.redirect('http://localhost:5173/login?error=google_failed');
        }

        try {
          const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
          );

          console.log('Token created, redirecting to frontend...');
          res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&user_id=${user.user_id}&role_id=${user.role_id}&first_name=${user.first_name}&last_name=${user.last_name}&email=${user.email}`);
        } catch (error) {
          console.error('Token error:', error);
          res.redirect('http://localhost:5173/login?error=server_error');
        }
      });
    })(req, res, next);
  }
);

module.exports = router;