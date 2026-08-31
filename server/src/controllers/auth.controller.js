import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const reqInfo = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
  const result = await authService.login(req.body, reqInfo);

  // Set HTTP-only cookie as well for flexibility
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.user.role, req.body);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const updateUsername = asyncHandler(async (req, res) => {
  const result = await authService.updateUsername(req.user.id, req.user.role, req.body.username);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});
