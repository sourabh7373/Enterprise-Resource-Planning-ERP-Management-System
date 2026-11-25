require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const config = require('./backend/config/env');

const updateAdminRole = async () => {
  try {
    console.log('Connecting to MongoDB:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@erp.com';
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} not found. Creating user with SUPER_ADMIN role...`);
      user = new User({
        email,
        password: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
        role: 'SUPER_ADMIN',
        isActive: true
      });
    } else {
      console.log(`Found user ${email} with current role: ${user.role}. Updating role to SUPER_ADMIN...`);
      user.role = 'SUPER_ADMIN';
      user.isActive = true;
    }

    await user.save();
    console.log(`[SUCCESS] User ${email} successfully updated/created with role: SUPER_ADMIN`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin role:', error);
    process.exit(1);
  }
};

updateAdminRole();
