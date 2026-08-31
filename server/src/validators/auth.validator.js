import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required').trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'Password is too long'),
  }),
});

export const updateUsernameSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, and hyphens')
      .trim(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    otpCode: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  }),
});
