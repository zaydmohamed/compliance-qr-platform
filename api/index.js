import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Connect to MongoDB on cold start
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

export default handler;
