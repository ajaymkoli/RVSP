const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  // If we're in test environment, use in-memory database
  if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected to in-memory server');
  } else {
    // Use regular database connection
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('Database connection error:', error.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  if (mongoServer) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  } else {
    await mongoose.connection.close();
  }
};

module.exports = { connectDB, disconnectDB };