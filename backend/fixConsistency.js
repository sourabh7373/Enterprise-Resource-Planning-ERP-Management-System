const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const config = require('./config/env');

async function fixConsistency() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to DB:', config.MONGO_URI);

    // Ensure at least one default Department exists for auto-creating missing employee profiles
    let defaultDept = await Department.findOne({});
    if (!defaultDept) {
      defaultDept = await Department.create({
        name: 'General',
        code: 'GEN',
        description: 'General Department'
      });
      console.log('Created default Department for linking:', defaultDept._id);
    }

    const users = await User.find({});
    console.log(`Total users found: ${users.length}`);

    for (const u of users) {
      // Find employee by user reference
      let emp = await Employee.findOne({ user: u._id });

      if (!emp) {
        // Find employee by email
        emp = await Employee.findOne({ email: u.email });
        if (emp) {
          console.log(`[LINK] Linking existing Employee (${emp.fullName}, email: ${emp.email}) to User ID: ${u._id}`);
          emp.user = u._id;
          await emp.save();
        } else if (u.role === 'EMPLOYEE') {
          // Create missing employee profile for EMPLOYEE role if none exists
          const namePart = u.email.split('@')[0];
          const fullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          const employeeId = 'EMP' + Math.floor(1000 + Math.random() * 9000);
          
          console.log(`[CREATE] Creating missing Employee profile for User: ${u.email} (${u._id})`);
          emp = await Employee.create({
            fullName: fullName,
            employeeId: employeeId,
            email: u.email,
            phone: '9999999999',
            department: defaultDept._id,
            designation: 'Staff',
            employmentStatus: 'Active',
            user: u._id
          });
        }
      } else {
        // Ensure email matches if linked by user ID
        if (emp.email !== u.email) {
          console.log(`[SYNC] Updating Employee email ${emp.email} to match User email ${u.email}`);
          emp.email = u.email;
          await emp.save();
        }
        console.log(`[OK] User ${u.email} is correctly linked to Employee ${emp.fullName}`);
      }
    }

    console.log('Employee-User consistency check & repair completed successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during consistency repair:', err);
  }
}

fixConsistency();
