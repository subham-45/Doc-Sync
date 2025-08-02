import passport from "passport";
import User from "./models/User.js";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      const baseUsername = profile.emails[0].value.split("@")[0];
      let finalUsername = baseUsername;
      let counter = 1;
    
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${counter++}`;
      }
    
      user = await User.create({
        fullName: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        username: finalUsername
      });
    }    
    return done(null, user);
  }
));
