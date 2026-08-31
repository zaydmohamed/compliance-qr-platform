import mongoose from 'mongoose';
import { ENV } from './env.js';
import { ensureInitialData } from '../utils/autoSeed.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin user and default settings if not already present
    ensureInitialData().catch(err => {
      console.warn('[AutoSeed Warning] Non-blocking auto seed error:', err.message);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB disconnected. Reconnecting...');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Initial connection failed: ${error.message}`);
    if (ENV.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};
