import mongoose from 'mongoose';

// Track connection state globally
export let isDbConnected = false;

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskpulse-ai';
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if DB is offline
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isDbConnected = true;
  } catch (error) {
    console.warn(`[WARNING] MongoDB connection failed: ${error.message}`);
    console.warn('[WARNING] Running server in database-offline mode. Mock sessions will operate in memory.');
    isDbConnected = false;
  }
};

export default connectDB;
