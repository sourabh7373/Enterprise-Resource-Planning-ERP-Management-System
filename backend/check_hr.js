const mongoose = require('mongoose');
require('dotenv').config();

async function checkHrUser() {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/erp_db');
    const users = await conn.connection.db.collection('users').find({}).toArray();
    console.log('Users in erp_db:');
    users.forEach(u => console.log({ email: u.email, role: u.role }));
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}
checkHrUser();
