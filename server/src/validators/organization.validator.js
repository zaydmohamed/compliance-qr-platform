import { z } from 'zod';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters').trim(),
    displayTitle: z.string().optional(),
    email: z.string().email('Invalid email address format').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^[0-9+\s-]*$/, 'Phone number must contain only digits and valid symbols (+, -)')
      .optional()
      .or(z.literal('')),
    whatsapp: z
      .string()
      .regex(/^[0-9+\s-]*$/, 'WhatsApp number must contain only digits and valid symbols (+, -)')
      .optional()
      .or(z.literal('')),
    organizationType: z.enum(['Hospital', 'Hotel', 'Company', 'University', 'HOSPITAL', 'HOTEL', 'COMPANY', 'UNIVERSITY']),
    complaintCategories: z.array(z.string().min(1)).optional(),
    address: z.string().optional(),
    branch: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    displayTitle: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    organizationType: z.enum(['Hospital', 'Hotel', 'Company', 'University']).optional(),
    complaintCategories: z.array(z.string().min(1)).optional(),
    address: z.string().optional(),
    branch: z.string().optional(),
    description: z.string().optional(),
  }),
});
