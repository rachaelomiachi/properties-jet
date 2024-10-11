const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['client', 'owner', 'real-estate-company', 'agent'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Client-specific fields
  preferredLocation: {
    type: String,
    required: function () {
      return this.userType === 'client';
    },
  },
  budget: {
    type: Number,
    required: function () {
      return this.userType === 'client';
    },
  },
  // Property Owner-specific fields
  propertyAddress: {
    type: String,
    required: function () {
      return this.userType === 'owner';
    },
  },
  // Real Estate Company-specific fields
  companyName: {
    type: String,
    required: function () {
      return this.userType === 'real-estate-company';
    },
  },
  // Agent-specific fields
  agencyName: {
    type: String,
    required: function () {
      return this.userType === 'agent';
    },
  },
});

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    user.password = await bcrypt.hash(user.password, salt);

    next(); // Proceed with the save operation
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
