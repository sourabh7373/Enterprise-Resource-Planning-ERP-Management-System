require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const config = require('./backend/config/env');
const jwt = require('jsonwebtoken');

const accounts = [
  { email: 'hr@erp.com', role: 'HR_MANAGER' },
  { email: 'finance@erp.com', role: 'FINANCE_MANAGER' },
  { email: 'sales@erp.com', role: 'SALES_MANAGER' },
  { email: 'inventory@erp.com', role: 'INVENTORY_MANAGER' }
];

const password = 'Test@12345';

const seedTestAccounts = async () => {
  try {
    console.log('Connecting to MongoDB:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    
    for (const acc of accounts) {
      const existingUser = await User.findOne({ email: acc.email });
      if (existingUser) {
        console.log(`User already exists: ${acc.email} (Role: ${existingUser.role}). Skipping creation.`);
        // Verify login
        const isMatch = await existingUser.comparePassword(password);
        console.log(`Verification for ${acc.email}: password match = ${isMatch}, isActive = ${existingUser.isActive}`);
        continue;
      }

      const user = new User({
        email: acc.email,
        password: password,
        role: acc.role,
        isActive: true
      });

      await user.save();
      console.log(`Created new test user: ${acc.email} with role ${acc.role}`);

      // Verify login
      const createdUser = await User.findOne({ email: acc.email });
      const isMatch = await createdUser.comparePassword(password);
      console.log(`Verification for ${acc.email}: password match = ${isMatch}, isActive = ${createdUser.isActive}`);
    }

    console.log('All accounts checked/created and verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test accounts:', error);
    process.exit(1);
  }
};

seedTestAccounts();
