require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@erp.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      email,
      password,
      role: 'SUPER_ADMIN',
      isActive: true
    });

    await admin.save();
    console.log('Super Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
