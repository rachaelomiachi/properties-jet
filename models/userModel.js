const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    userType: { type: String, required: true, enum: ['client', 'owner', 'real-estate-company', 'agent'] },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    oauthProvider: { type: String }, // Added for OAuth
    oauthId: { type: String }, // ID from the OAuth provider
    additionalFields: {
        budget: { type: Number },
        preferredLocation: { type: String },
        propertyAddress: { type: String },
        companyName: { type: String },
        agencyName: { type: String },
    },
});

// Password hashing before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
