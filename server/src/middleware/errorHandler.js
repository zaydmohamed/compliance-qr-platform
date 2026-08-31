import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors.length > 0 ? errors.join('. ') : 'Validation failed';
  }

  // Handle Zod Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    errors = err.errors ? err.errors.map((e) => `${e.path.join('.')}: ${e.message}`) : [];
    message = errors.length > 0 ? errors.join('. ') : 'Invalid request input';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  }

  // Log error internally in dev/production without leaking to response
  if (statusCode === 500) {
    console.error(`[Error 500] ${req.method} ${req.originalUrl}:`, err);
    if (ENV.NODE_ENV === 'production') {
      message = 'An unexpected server error occurred. Please try again later.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {}),
  });
};
