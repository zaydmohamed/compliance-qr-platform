import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

const handler = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Serverless DB Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured and IP whitelist includes 0.0.0.0/0.',
    });
  }
  return app(req, res);
};

export default handler;
