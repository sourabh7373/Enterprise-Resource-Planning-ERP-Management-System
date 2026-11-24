const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

const verifyAllAccounts = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    
    const targets = [
      { email: 'admin@erp.com', expectedRole: 'SUPER_ADMIN' },
      { email: 'hr@erp.com', expectedRole: 'HR_MANAGER' },
      { email: 'finance@erp.com', expectedRole: 'FINANCE_MANAGER' },
      { email: 'sales@erp.com', expectedRole: 'SALES_MANAGER' },
      { email: 'inventory@erp.com', expectedRole: 'INVENTORY_MANAGER' },
      { email: 'sourabh732000@gmail.com', expectedRole: 'EMPLOYEE' }
    ];

    for (const t of targets) {
      const user = await User.findOne({ email: t.email });
      if (!user) {
        console.log(`[FAIL] User not found in DB: ${t.email}`);
      } else {
        const match = user.role === t.expectedRole;
        console.log(`[${match ? 'PASS' : 'FAIL'}] User: ${t.email} | Role in DB: ${user.role} | Expected: ${t.expectedRole} | Active: ${user.isActive}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error verifying accounts:', error);
    process.exit(1);
  }
};

verifyAllAccounts();
