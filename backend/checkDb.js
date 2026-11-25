const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const config = require('./config/env');

async function check() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to DB:', config.MONGO_URI);
    
    const users = await User.find({});
    console.log('Users count:', users.length);
    for (const u of users) {
      console.log('User:', u.email, 'Role:', u.role, 'ID:', u._id);
      const empByRef = await Employee.findOne({ user: u._id });
      const empByEmail = await Employee.findOne({ email: u.email });
      console.log('  -> Employee by user ref:', empByRef ? empByRef.fullName + ' (' + empByRef._id + ')' : 'NONE');
      console.log('  -> Employee by email:', empByEmail ? empByEmail.fullName + ' (' + empByEmail._id + '), user field: ' + empByEmail.user : 'NONE');
    }

    const employees = await Employee.find({});
    console.log('\nEmployees count:', employees.length);
    for (const e of employees) {
      console.log('Employee:', e.fullName, 'Email:', e.email, 'UserRef:', e.user);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
