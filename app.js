const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const port = process.env.PORT||3800;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/userModel');
mongoose.connect(process.env.MONGODB_CONNECTION).then(()=>{console.log("Database Connected")}).catch((err)=>{console.log(err)});


// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { email, name } = profile._json;
        const userType = 'client'; // Default user type, can be modified based on your logic
        const user = { email, fullName: name, userType, oauthProvider: 'google', oauthId: profile.id };
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Facebook OAuth strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { email, displayName } = profile._json;
        const userType = 'client';
        const user = { email, fullName: displayName, userType, oauthProvider: 'facebook', oauthId: profile.id };
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Serialize and deserialize user (needed for session handling)
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// console.log(require('crypto').randomBytes(64).toString('hex'));












app.listen(port,(req, res)=>{
    console.log(`server up and running @ http://localhost:${port}/`)
})