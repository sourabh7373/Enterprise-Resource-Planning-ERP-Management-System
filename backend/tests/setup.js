const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.14',
    },
    instance: {
      replSet: 'rs0',
    },
  });
  const uri = mongoServer.getUri();
  
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
};

const closeTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
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
