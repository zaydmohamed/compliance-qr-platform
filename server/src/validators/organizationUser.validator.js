import { z } from 'zod';

export const createOrgUserSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .regex(/^[a-zA-Z\s.'-]+$/, 'Full name must contain only text letters')
      .trim(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, and hyphens')
      .trim(),
    phone: z
      .string()
      .min(5, 'Valid phone number is required')
      .regex(/^[0-9+\s-]+$/, 'Phone number must contain only digits')
      .trim(),
    password: z.string().min(6).optional(),
  }),
});

export const updateOrgUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(5).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  }),
});
