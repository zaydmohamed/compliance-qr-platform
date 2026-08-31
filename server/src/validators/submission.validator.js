import { z } from 'zod';
import {
  SUBMISSION_TYPE,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
} from '../constants/statuses.js';

export const publicSubmissionSchema = z.object({
  body: z.object({
    qrToken: z.string().min(10, 'Valid QR token is required'),
    type: z.enum([SUBMISSION_TYPE.COMPLAINT, SUBMISSION_TYPE.FEEDBACK]),
    customerName: z.string().max(100, 'Name is too long').optional(),
    customerPhone: z
      .string()
      .regex(/^[0-9+\s-]*$/, 'Phone number must contain only digits')
      .optional()
      .or(z.literal('')),
    category: z.string().optional(),
    message: z.string().min(3, 'Message must be at least 3 characters long').max(1000).trim(),
    suggestedSolution: z.string().max(1000).optional(),
  }),
});

export const updateSubmissionStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(COMPLAINT_STATUS)),
    notes: z.string().optional(),
  }),
});

export const updateSubmissionPrioritySchema = z.object({
  body: z.object({
    priority: z.enum(Object.values(COMPLAINT_PRIORITY)),
  }),
});
