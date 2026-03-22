import { z } from 'zod';

export const serviceTypes = ['Dry Cleaning', 'Wash & Fold', 'Alterations', 'Pickup Coordination'] as const;
export const briefStatuses = ['new', 'in_progress', 'ready'] as const;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createBriefSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  serviceType: z.enum(serviceTypes),
  dueDate: z.string().regex(isoDatePattern, 'dueDate must use YYYY-MM-DD').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'dueDate must be a valid calendar date'),
  priority: z.coerce.number().int().min(1).max(3).transform((value) => value as 1 | 2 | 3),
  notes: z.string().trim().min(10).max(600),
});

export const updateStatusSchema = z.object({
  status: z.enum(briefStatuses),
});

export type CreateBriefInput = z.infer<typeof createBriefSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
