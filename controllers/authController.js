const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel'); 
require("dotenv").config()
// User Login Controller
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            "racheal", 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        let redirectUrl;
        let successMessage = "Welcome! Create your profile to enjoy the maximum package.";
        
        switch (user.userType) {
            case 'client':
                redirectUrl = '/property-listing';
                break;
            case 'owner':
                redirectUrl = '/owners-page';
                break;
            case 'agent':
                redirectUrl = '/agency-page';
                break;
            case 'real-estate-company':
                redirectUrl = '/real-estate-page';
                break;
            default:
                redirectUrl = '/';
        }

        res.status(200).json({
            message: successMessage,
            redirectUrl
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// User Registration Controller
const registerUser = async (req, res) => {
    const { fullName, userType, phoneNumber, email, password, preferredLocation, budget, propertyAddress, companyName, agencyName } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate required fields based on userType
        if (!fullName || !userType || !phoneNumber || !email || !password) {
            return res.status(400).json({ message: 'Full name, user type, phone number, email, and password are required.' });
        }

        // Specific checks for userType
        if (userType === 'client') {
            if (!preferredLocation) {
                return res.status(400).json({ message: 'Preferred location is required for clients.' });
            }
            if (budget === undefined) {
                return res.status(400).json({ message: 'Budget is required for clients.' });
            }
        } else if (userType === 'owner') {
            if (!propertyAddress) {
                return res.status(400).json({ message: 'Property address is required for owners.' });
            }
        } else if (userType === 'real-estate-company') {
            if (!companyName) {
                return res.status(400).json({ message: 'Company name is required for real estate companies.' });
            }
        } else if (userType === 'agent') {
            if (!agencyName) {
                return res.status(400).json({ message: 'Agency name is required for agents.' });
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user based on the form fields
        const newUser = new User({
            fullName,
            userType,
            phoneNumber,
            email,
            password: hashedPassword,
            preferredLocation,
            budget,
            propertyAddress,
            companyName,
            agencyName
        });

        // Save the user to the database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, userType: newUser.userType },
            process.env.JWT_SECRETE,
            { expiresIn: '1h' }
        );

        // Store the token in an HTTP-only, Secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
            sameSite: 'strict', 
            maxAge: 3600000 // 1 hour expiration in milliseconds
        });

        // Redirect based on user type and send a success message
        let redirectUrl;
        let successMessage = "Welcome! Create your profile to enjoy the maximum package.";
        
        switch (newUser.userType) {
            case 'client':
                //redirectUrl = '/property-listing';
                 res.status(201).json({
            message: successMessage,
            token
            
        });
                break;
            case 'owner':
                //redirectUrl = '/owners-page';
                res.status(201).json({
                    message: successMessage,
                    token
                    
                });
                break;
            case 'agent':
                //redirectUrl = '/agency-page';
                res.status(201).json({
                    message: successMessage,
                    token
                });
                break;
            case 'real-estate-company':
                //redirectUrl = '/real-estate-page';
                res.status(201).json({
                    message: successMessage,
                    token
                });
                break;
            default:
                //redirectUrl = '/';
        }

        // Respond with a success message and the redirect URL
        // res.status(201).json({
        //     message: successMessage,
        //     redirectUrl
        // });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    loginUser,
    registerUser
};
