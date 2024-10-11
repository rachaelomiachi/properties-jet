const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Register user (email/password)
exports.registerUser = async (req, res) => {
    const { fullName, userType, phoneNumber, email, password } = req.body;

    // Validate core fields
    if (!fullName || !userType || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        user = new User({ fullName, userType, phoneNumber, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Redirect based on user type
        if (userType === 'client') {
            return res.status(201).json({ message: 'Client registered successfully', token });
        } else {
            return res.status(201).json({
                message: 'User registered successfully. Please complete your profile.',
                userId: user._id,
                userType: userType,
                token // Include token for further authenticated actions
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Complete profile for non-client users
exports.completeProfile = async (req, res) => {
    const { userId, additionalFields } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.additionalFields = { ...user.additionalFields, ...additionalFields };
        await user.save();

        res.status(200).json({ message: 'Profile completed successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// OAuth Registration (Google and Facebook)
exports.oauthRegister = async (req, res) => {
    const { email, fullName, userType, oauthProvider, oauthId } = req.user; // Provided by Passport

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (!user) {
        // If user doesn't exist, create a new one
        user = new User({ fullName, userType, email, oauthProvider, oauthId });
        await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect based on user type
    if (userType === 'client') {
        return res.status(201).json({ message: 'Client registered successfully', token });
    } else {
        return res.status(201).json({
            message: 'User registered successfully. Please complete your profile.',
            userId: user._id,
            userType: userType,
            token
        });
    }
};
