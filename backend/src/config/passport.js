const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

console.log('Loading Google Strategy...');
console.log('Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);

passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile received:', profile.displayName);
    
    const email = profile.emails[0].value;
    const first_name = profile.name.givenName;
    const last_name = profile.name.familyName;

    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return done(null, existing.rows[0]);
    }

    const newUser = await pool.query(
      `INSERT INTO users 
        (first_name, last_name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4, 1)
       RETURNING *`,
      [first_name, last_name, email, 'GOOGLE_AUTH_NO_PASSWORD']
    );

    return done(null, newUser.rows[0]);

  } catch (error) {
    console.error('Passport Google Strategy error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1', [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;