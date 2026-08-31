import { z } from 'zod';

export const createRenewalRequestSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
});

export const approveRenewalSchema = z.object({
  body: z.object({
    amount: z.number().min(0, 'Payment amount must be 0 or greater').default(0),
    paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Mobile Money', 'Other']).default('Cash'),
    referenceNumber: z.string().optional(),
    durationDays: z.number().min(1).default(30),
    notes: z.string().optional(),
  }),
});

export const rejectRenewalSchema = z.object({
  body: z.object({
    rejectionReason: z.string().min(3, 'Rejection reason is required').trim(),
  }),
});
