import mongoose from 'mongoose';
import { ENV } from './env.js';
import { ensureInitialData } from '../utils/autoSeed.js';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin user and default settings if not already present
    ensureInitialData().catch(err => {
      console.warn('[AutoSeed Warning] Non-blocking auto seed error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Initial connection failed: ${error.message}`);
    throw error;
  }
};
