const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const config = require('./config/env');

async function fix() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to DB:', config.MONGO_URI);
    
    // Find all users and employees
    const users = await User.find({});
    for (const u of users) {
      // Check if employee exists by user ref or email
      let employee = await Employee.findOne({ user: u._id });
      if (!employee) {
        employee = await Employee.findOne({ email: u.email });
        if (employee) {
          console.log(`Linking existing employee ${employee.fullName} (${employee.email}) to user ${u.email} (${u._id})`);
          employee.user = u._id;
          await employee.save();
        }
      } else {
        console.log(`Employee ${employee.fullName} is already linked to user ${u.email}`);
      }
    }

    console.log('Database relationship check and repair completed.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}
fix();
