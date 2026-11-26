require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

const updateJohnAttendanceUser = async () => {
  try {
    console.log('Connecting to MongoDB:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const email = 'john.attendance@erp.com';
    const newPassword = 'ERP@Demo123';

    let user = await User.findOne({ email });
    if (!user) {
      console.log(`[FAIL] User not found: ${email}`);
      process.exit(1);
    }

    console.log(`User found: ${email} (Role: ${user.role}, ID: ${user._id}). Updating password...`);
    user.password = newPassword; // triggers pre-save bcrypt hash middleware
    await user.save();
    console.log(`[SUCCESS] Password updated successfully for ${email}`);

    // Verify login / comparePassword
    const verifiedUser = await User.findOne({ email });
    const isMatch = await verifiedUser.comparePassword(newPassword);
    console.log(`Verification -> Email: ${email}, Password Match: ${isMatch}, Active: ${verifiedUser.isActive}, Role: ${verifiedUser.role}`);

    if (isMatch) {
      console.log('[SUCCESS] Login verification succeeded with the new password.');
    } else {
      console.log('[FAIL] Login verification failed!');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating user password:', error);
    process.exit(1);
  }
};

updateJohnAttendanceUser();
