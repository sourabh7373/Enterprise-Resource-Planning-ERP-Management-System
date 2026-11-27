const mongoose = require('mongoose');

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/erp_test_db';

const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
};

module.exports = { connectTestDB, closeTestDB, clearTestDB };
