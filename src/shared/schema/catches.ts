import { z } from 'zod';

export const createCatchSchema = z.object({
  speciesId: z.string().min(1),
  waterId: z.string().optional(),
  lengthIn: z.number().min(1).max(120),
  weightLb: z.number().min(0.1).max(200),
  lure: z.string().max(120).optional(),
  notes: z.string().max(400).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  caughtAt: z.string().datetime().optional(),
  photoKey: z.string().min(3).optional(),
  turnstileToken: z.string().optional(),
});

export const catchQuerySchema = z.object({
  leagueId: z.string().optional(),
  speciesId: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const moderationSchema = z.object({
  catchId: z.string().min(1),
  action: z.enum(['approve', 'flag', 'reject']),
  reason: z.string().min(3).max(240),
});
