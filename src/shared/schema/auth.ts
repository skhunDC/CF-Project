import { z } from 'zod';

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().min(10),
});

export const sessionExchangeSchema = z.object({
  token: z.string().min(12),
});

export const oauthSchema = z.object({
  provider: z.enum(['google', 'apple']),
  code: z.string().min(6),
  turnstileToken: z.string().optional(),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(48),
  handle: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/i),
  homeRegion: z.string().min(2).max(64),
  favoriteSpecies: z.string().min(2).max(64).optional(),
});
