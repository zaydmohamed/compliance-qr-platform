import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    amount: z.number().min(0, 'Amount must be a positive number'),
    currency: z.string().default('USD'),
    paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Mobile Money', 'Other']),
    referenceNumber: z.string().optional(),
    periodStartDate: z.string().min(1, 'Period start date is required'),
    periodEndDate: z.string().min(1, 'Period end date is required'),
    notes: z.string().optional(),
  }),
});
