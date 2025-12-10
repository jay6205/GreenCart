import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/user.models.js"
import crypto from "crypto"


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

    async (accessToken, refreshToken, profile, done) => {
        // console.log("Google Profile: ", profile);
        try {
            const email = profile.emails?.[0]?.value;
            let user = await User.findOne({ googleId: profile.id })
            if (!user && email) {
                user = await User.findOne({ email });
            }
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName || "John Doe",
                    email: profile.emails[0].value || undefined,
                    provider: "google",
                    password: crypto.randomBytes(32).toString("hex")
                })
            }
            else {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.provider = "google";
                    await user.save();
                }
            }
            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }

))

export default passport