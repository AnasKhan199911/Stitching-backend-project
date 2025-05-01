const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel");  // Assuming you are using MongoDB with Mongoose

passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "http://localhost:5000/api/auth/google/callback"
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
          });
          await user.save();
        }

        // Return the user profile
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
