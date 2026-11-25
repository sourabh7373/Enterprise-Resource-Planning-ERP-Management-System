require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

const demoAccounts = [
  { email: 'superadmin@erp.com', role: 'SUPER_ADMIN' },
  { email: 'hr@erp.com', role: 'HR_MANAGER' },
  { email: 'finance@erp.com', role: 'FINANCE_MANAGER' },
  { email: 'sales@erp.com', role: 'SALES_MANAGER' },
  { email: 'inventory@erp.com', role: 'INVENTORY_MANAGER' },
  { email: 'employee@erp.com', role: 'EMPLOYEE' }
];

const password = 'ERP@Demo123';

const seedDemoAccounts = async () => {
  try {
    console.log('Connecting to MongoDB:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (user) {
        console.log(`User found: ${acc.email}. Updating role to ${acc.role} and password...`);
        user.role = acc.role;
        user.password = password; // triggers pre-save hash middleware
        user.isActive = true;
        await user.save();
        console.log(`[UPDATED] ${acc.email} (${acc.role})`);
      } else {
        console.log(`User not found: ${acc.email}. Creating new account...`);
        user = new User({
          email: acc.email,
          password: password,
          role: acc.role,
          isActive: true
        });
        await user.save();
        console.log(`[CREATED] ${acc.email} (${acc.role})`);
      }

      // Verify login comparison
      const verifiedUser = await User.findOne({ email: acc.email });
      const isMatch = await verifiedUser.comparePassword(password);
      console.log(`Verification -> Email: ${acc.email}, Role: ${verifiedUser.role}, Password Match: ${isMatch}, Active: ${verifiedUser.isActive}`);
    }

    console.log('\nAll 6 demo accounts configured and verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo accounts:', error);
    process.exit(1);
  }
};

seedDemoAccounts();
